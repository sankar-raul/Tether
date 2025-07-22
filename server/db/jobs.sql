use tether;
-- select * from refresh_tokens;
create event if not exists delete_expired_refreshtokens
	on schedule every 1 day
    do
    delete from refresh_tokens where expires_at < now();