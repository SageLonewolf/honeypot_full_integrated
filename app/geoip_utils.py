import geoip2.database
import os

GEOIP_DB_PATH = os.path.join(os.getcwd(), "GeoLite2-City.mmdb")  # place at project root or change path

def get_geo(ip: str):
    """Return a dict: country, country_code, city, latitude, longitude, flag"""
    result = {
        "country": "Unknown",
        "country_code": "",
        "city": "Unknown",
        "latitude": None,
        "longitude": None,
        "flag": "🏳️"
    }
    try:
        with geoip2.database.Reader(GEOIP_DB_PATH) as reader:
            resp = reader.city(ip)
            country_name = resp.country.name or "Unknown"
            country_code = (resp.country.iso_code or "").lower()
            city = resp.city.name or "Unknown"
            lat = resp.location.latitude
            lon = resp.location.longitude
            # flag emoji from ISO
            flag = "".join(chr(0x1F1E6 + ord(c) - ord('A')) for c in (resp.country.iso_code or ""))
            result.update({
                "country": country_name,
                "country_code": country_code,
                "city": city,
                "latitude": lat,
                "longitude": lon,
                "flag": flag or "🏳️"
            })
    except Exception:
        pass
    return result
