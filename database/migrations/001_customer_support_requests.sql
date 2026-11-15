CREATE TABLE IF NOT EXISTS customer_support_requests (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(160) NOT NULL,
    category VARCHAR(30) NOT NULL CHECK (category IN ('general', 'booking', 'payment', 'venue', 'vendor', 'complaint')),
    message TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_review', 'resolved')),
    admin_response TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_support_requests_user_created
    ON customer_support_requests(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_requests_status_created
    ON customer_support_requests(status, created_at DESC);
