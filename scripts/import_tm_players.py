#!/usr/bin/env python3
"""One-time loader: Transfermarkt players dataset -> your Supabase `tm_players`.

Usage:
    1. First run supabase/tm_players.sql in the Supabase SQL Editor.
    2. Then:  python3 scripts/import_tm_players.py

It reads EXPO_PUBLIC_SUPABASE_URL + EXPO_PUBLIC_SUPABASE_ANON_KEY from
.env.local automatically. To use a service_role key instead (recommended if you
later lock down RLS), set SUPABASE_KEY in the environment.

Stdlib only — no pip install needed. Re-runnable: upserts on player id.
"""
import csv
import gzip
import io
import json
import os
import sys
import urllib.request

DATA_URL = "https://pub-e682421888d945d684bcae8890b0ec20.r2.dev/data/players.csv.gz"
BATCH = 1000
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def load_env():
    url = os.environ.get("EXPO_PUBLIC_SUPABASE_URL", "")
    key = os.environ.get("SUPABASE_KEY", "") or os.environ.get("EXPO_PUBLIC_SUPABASE_ANON_KEY", "")
    env_path = os.path.join(ROOT, ".env.local")
    if (not url or not key) and os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, v = line.split("=", 1)
                v = v.strip().strip('"').strip("'")
                if k == "EXPO_PUBLIC_SUPABASE_URL" and not url:
                    url = v
                elif k == "EXPO_PUBLIC_SUPABASE_ANON_KEY" and not os.environ.get("SUPABASE_KEY"):
                    key = key or v
    if not url or not key:
        sys.exit("Missing Supabase URL/key. Check .env.local.")
    return url.rstrip("/"), key


def clean_date(v):
    v = (v or "").strip()
    return v[:10] if len(v) >= 10 else None


def clean_int(v):
    v = (v or "").strip()
    try:
        return int(float(v))
    except (ValueError, TypeError):
        return None


def row_to_record(r):
    if not r.get("market_value_in_eur", "").strip():
        return None  # only priced players are useful for scouting
    if r.get("position") == "Missing":
        return None
    club = (r.get("current_club_name") or "").strip()
    return {
        "id": r["player_id"],
        "name": r.get("name") or (r.get("first_name", "") + " " + r.get("last_name", "")).strip(),
        "position": r.get("position") or None,
        "sub_position": r.get("sub_position") or None,
        "club": club or None,  # empty => free agent
        "club_id": clean_int(r.get("current_club_id")),
        "market_value": clean_int(r.get("market_value_in_eur")),
        "highest_market_value": clean_int(r.get("highest_market_value_in_eur")),
        "contract_until": clean_date(r.get("contract_expiration_date")),
        "dob": clean_date(r.get("date_of_birth")),
        "foot": (r.get("foot") or "").strip() or None,
        "height": clean_int(r.get("height_in_cm")),
        "nationality": (r.get("country_of_citizenship") or "").strip() or None,
        "image_url": r.get("image_url") or None,
        "url": r.get("url") or None,
        "last_season": clean_int(r.get("last_season")),
    }


def upsert(url, key, batch):
    body = json.dumps(batch).encode("utf-8")
    req = urllib.request.Request(
        f"{url}/rest/v1/tm_players",
        data=body,
        method="POST",
        headers={
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates,return=minimal",
        },
    )
    with urllib.request.urlopen(req) as resp:
        return resp.status


def main():
    url, key = load_env()
    print(f"Downloading dataset… ({DATA_URL})")
    with urllib.request.urlopen(DATA_URL) as resp:
        raw = resp.read()
    text = gzip.decompress(raw).decode("utf-8")
    rows = list(csv.DictReader(io.StringIO(text)))
    records = [rec for r in rows if (rec := row_to_record(r))]
    print(f"Parsed {len(rows)} rows -> {len(records)} priced players to import.")

    sent = 0
    for i in range(0, len(records), BATCH):
        batch = records[i:i + BATCH]
        try:
            upsert(url, key, batch)
        except urllib.error.HTTPError as e:
            sys.exit(f"\nImport failed at batch {i}: HTTP {e.code} — {e.read().decode()[:400]}")
        sent += len(batch)
        print(f"  upserted {sent}/{len(records)}", end="\r", flush=True)
    print(f"\nDone. {sent} players loaded into tm_players.")


if __name__ == "__main__":
    main()
