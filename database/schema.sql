-- PostgreSQL schema draft. Apply via versioned migrations in production.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE app_user (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_subject VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE user_preference (
  user_id UUID PRIMARY KEY REFERENCES app_user(id) ON DELETE CASCADE,
  native_language VARCHAR(8) NOT NULL DEFAULT 'tr',
  target_level VARCHAR(2) NOT NULL DEFAULT 'A1' CHECK (target_level IN ('A1','A2','B1')),
  audio_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE content_item (
  id VARCHAR(80) PRIMARY KEY,
  content_type VARCHAR(16) NOT NULL CHECK (content_type IN ('word','verb','grammar','topic')),
  level VARCHAR(2) NOT NULL CHECK (level IN ('A1','A2','B1')),
  german_text TEXT NOT NULL,
  example_sentence TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  source_name VARCHAR(120) NOT NULL,
  source_url TEXT,
  source_checked_at DATE,
  license_note TEXT,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE content_translation (
  content_id VARCHAR(80) NOT NULL REFERENCES content_item(id) ON DELETE CASCADE,
  language_code VARCHAR(8) NOT NULL,
  meaning TEXT NOT NULL,
  sentence_translation TEXT,
  PRIMARY KEY (content_id, language_code)
);

CREATE TABLE user_learning_progress (
  user_id UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  content_id VARCHAR(80) NOT NULL REFERENCES content_item(id),
  status VARCHAR(16) NOT NULL DEFAULT 'learning' CHECK (status IN ('new','learning','mastered')),
  correct_count INTEGER NOT NULL DEFAULT 0,
  wrong_count INTEGER NOT NULL DEFAULT 0,
  last_seen_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, content_id)
);

CREATE TABLE learning_session (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  selected_level VARCHAR(2) NOT NULL CHECK (selected_level IN ('A1','A2','B1')),
  module VARCHAR(16) NOT NULL CHECK (module IN ('words','verbs','grammar','mistakes','mixed')),
  item_ids JSONB NOT NULL,
  item_index INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE mistake_review (
  user_id UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  content_id VARCHAR(80) NOT NULL REFERENCES content_item(id),
  wrong_count INTEGER NOT NULL DEFAULT 1,
  successful_review_times TIMESTAMPTZ[] NOT NULL DEFAULT '{}',
  first_wrong_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_wrong_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, content_id)
);

CREATE TABLE user_subscription (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  platform VARCHAR(16) NOT NULL CHECK (platform IN ('apple','google')),
  store_product_id VARCHAR(160) NOT NULL,
  transaction_reference VARCHAR(255) NOT NULL,
  status VARCHAR(16) NOT NULL CHECK (status IN ('active','expired','revoked','pending')),
  valid_until TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  UNIQUE(platform, transaction_reference)
);

CREATE TABLE ad_policy_config (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  interstitial_cooldown_seconds INTEGER NOT NULL DEFAULT 1200,
  mini_ad_every_answers INTEGER NOT NULL DEFAULT 3,
  pro_removes_all_ads BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO ad_policy_config (id) VALUES (1) ON CONFLICT DO NOTHING;

CREATE INDEX idx_content_level_type ON content_item(level, content_type) WHERE published = TRUE;
CREATE INDEX idx_session_user_updated ON learning_session(user_id, updated_at DESC);
