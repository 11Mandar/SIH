import sqlite3

conn = sqlite3.connect('lognexus.db')
for row in conn.execute("SELECT name, sql FROM sqlite_master WHERE type='table';"):
    print(f"-- Table: {row[0]}")
    print(row[1])
    print(";")
conn.close()
