import asyncio
from app.database import write_log, read_blocklist
from datetime import datetime
from app.geoip_utils import get_geo

LISTEN_PORTS = [
    (2222, "ssh"),    # fake ssh
    (8080, "http"),   # fake http
    (2121, "ftp")     # fake ftp
]

SERVER_TASKS = []

async def handle_client(reader: asyncio.StreamReader, writer: asyncio.StreamWriter, proto_label: str, port: int):
    peer = writer.get_extra_info("peername")
    ip = peer[0] if peer else "unknown"
    # check blocklist
    if ip in read_blocklist():
        writer.close()
        await writer.wait_closed()
        return
    # send banner to mimic service (non-protocol)
    try:
        if proto_label == "ssh":
            writer.write(b"SSH-2.0-OpenSSH_fake\r\n")
            await writer.drain()
            # prompt-like handshake simulation - read username/password if client sends
            data = await asyncio.wait_for(reader.readline(), timeout=8)
            text = data.decode(errors='ignore').strip()
            # if client sends something like "admin\npassword\n"
            username = None
            password = None
            if text:
                username = text
                # try to read next line as password
                try:
                    data2 = await asyncio.wait_for(reader.readline(), timeout=4)
                    password = data2.decode(errors='ignore').strip()
                except Exception:
                    password = ""
        elif proto_label == "http":
            # read first HTTP line
            writer.write(b"HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\n\r\nHello\r\n")
            await writer.drain()
            data = await asyncio.wait_for(reader.readline(), timeout=4)
            text = data.decode(errors='ignore').strip()
            username = ""
            password = ""
        else:
            writer.write(f"{proto_label.upper()} service\r\n".encode())
            await writer.drain()
            data = await asyncio.wait_for(reader.readline(), timeout=6)
            text = data.decode(errors='ignore').strip()
            username = ""
            password = ""
    except Exception:
        text = ""
        username = ""
        password = ""
    finally:
        try:
            writer.close()
            await writer.wait_closed()
        except Exception:
            pass

    # infer attack type
    attack_type = f"{proto_label.upper()} Probe"
    if proto_label == "ssh":
        attack_type = "SSH Brute Force"
    if text and ("GET" in text or "POST" in text):
        attack_type = "HTTP Probe"
    # geo enrichment
    geo = get_geo(ip)
    entry = {
        "ip": ip,
        "timestamp": datetime.utcnow().isoformat(),
        "username": username or "",
        "password": password or "",
        "attack_type": attack_type,
        "country": geo.get("country"),
        "country_code": geo.get("country_code"),
        "city": geo.get("city"),
        "latitude": geo.get("latitude"),
        "longitude": geo.get("longitude"),
        "flag": geo.get("flag")
    }
    write_log(entry)

async def _start_server(port, proto_label):
    server = await asyncio.start_server(lambda r, w: handle_client(r, w, proto_label, port), host="0.0.0.0", port=port)
    print(f"[honeypot] listening on 0.0.0.0:{port} ({proto_label})")
    async with server:
        await server.serve_forever()

async def start_listeners():
    global SERVER_TASKS
    tasks = []
    for port, proto in LISTEN_PORTS:
        t = asyncio.create_task(_start_server(port, proto))
        tasks.append(t)
    SERVER_TASKS = tasks
    # wait for tasks (blocks until cancelled)
    await asyncio.gather(*tasks)

async def stop_listeners():
    for t in SERVER_TASKS:
        t.cancel()
