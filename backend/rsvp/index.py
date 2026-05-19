import json
import os

import psycopg2

SCHEMA = "t_p24914580_wedding_invitation_s"

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def handler(event: dict, context) -> dict:
    """Сохранение и получение ответов гостей на свадьбу Любови и Владислава."""

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")

    if method == "POST":
        body = json.loads(event.get("body") or "{}")
        name = (body.get("name") or "").strip()
        attending = body.get("attending")
        guests = int(body.get("guests") or 1)
        diet = (body.get("diet") or "").strip() or None
        drinks = body.get("drinks") or []
        transfer = body.get("transfer")

        if not name or attending is None:
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "name and attending required"})}

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"INSERT INTO {SCHEMA}.rsvp (name, attending, guests, diet, drinks, transfer) "
            "VALUES (%s, %s, %s, %s, %s, %s) RETURNING id",
            (name, bool(attending), guests, diet, drinks if drinks else None,
             True if transfer == "yes" else (False if transfer == "no" else None))
        )
        row_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True, "id": row_id})}

    if method == "GET":
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"SELECT id, name, attending, guests, diet, drinks, transfer, created_at "
            f"FROM {SCHEMA}.rsvp ORDER BY created_at DESC"
        )
        rows = cur.fetchall()
        cur.close()
        conn.close()

        result = []
        for r in rows:
            result.append({
                "id": r[0],
                "name": r[1],
                "attending": r[2],
                "guests": r[3],
                "diet": r[4],
                "drinks": list(r[5]) if r[5] else [],
                "transfer": r[6],
                "created_at": r[7].isoformat() if r[7] else None,
            })

        total_guests = sum(r["guests"] for r in result if r["attending"])
        total_no = sum(1 for r in result if not r["attending"])
        need_transfer = sum(1 for r in result if r["transfer"])

        return {"statusCode": 200, "headers": CORS, "body": json.dumps({
            "rsvps": result,
            "total_guests": total_guests,
            "total_no": total_no,
            "need_transfer": need_transfer,
        })}

    return {"statusCode": 405, "headers": CORS, "body": json.dumps({"error": "Method not allowed"})}
