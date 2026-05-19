import json
import os
import psycopg2

SCHEMA = "t_p24914580_wedding_invitation_s"


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def handler(event: dict, context) -> dict:
    """Сохранение и получение ответов гостей на свадьбу."""
    cors = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors, "body": ""}

    method = event.get("httpMethod", "GET")

    if method == "POST":
        body = json.loads(event.get("body") or "{}")
        name = body.get("name", "").strip()
        attending = body.get("attending")
        guests = int(body.get("guests", 1))
        diet = body.get("diet", "").strip()

        if not name or attending is None:
            return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "name and attending are required"})}

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"INSERT INTO {SCHEMA}.rsvp (name, attending, guests, diet) VALUES (%s, %s, %s, %s) RETURNING id",
            (name, bool(attending), guests, diet or None)
        )
        row_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()

        return {"statusCode": 200, "headers": cors, "body": json.dumps({"ok": True, "id": row_id})}

    if method == "GET":
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"SELECT id, name, attending, guests, diet, created_at FROM {SCHEMA}.rsvp ORDER BY created_at DESC"
        )
        rows = cur.fetchall()
        cur.close()
        conn.close()

        result = [
            {
                "id": r[0],
                "name": r[1],
                "attending": r[2],
                "guests": r[3],
                "diet": r[4],
                "created_at": r[5].isoformat() if r[5] else None,
            }
            for r in rows
        ]
        total_yes = sum(r["guests"] for r in result if r["attending"])
        total_no = sum(1 for r in result if not r["attending"])

        return {"statusCode": 200, "headers": cors, "body": json.dumps({"rsvps": result, "total_yes": total_yes, "total_no": total_no})}

    return {"statusCode": 405, "headers": cors, "body": json.dumps({"error": "Method not allowed"})}
