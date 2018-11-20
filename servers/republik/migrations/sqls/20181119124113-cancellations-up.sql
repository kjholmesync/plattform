CREATE DOMAIN cancel_category AS TEXT
  CHECK(
    VALUE IN ('EDITORIAL', 'NO_TIME', 'LOGIN', 'PAPER', 'TOO_EXPENSIVE', 'OTHER')
  );

CREATE TABLE "membershipCancellations" (
  "id"              uuid primary key not null default uuid_generate_v4(),
  "membershipId"    uuid not null references "memberships"(id),
  "reason"          text,
  "category"        cancel_category not null,
  "createdAt"       timestamptz default now(),
  "updatedAt"       timestamptz default now()
);

INSERT INTO
  "membershipCancellations" ("membershipId", reason, category, "createdAt")
  (
    SELECT
      id as "membershipId",
      jsonb_array_elements_text("cancelReasons") as reason,
      'OTHER' as category,
      '2018-01-01'
    FROM
      memberships
  )
;

ALTER TABLE "memberships"
  DROP COLUMN "cancelReasons"
;
