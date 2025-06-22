use tether;
drop procedure if exists updateRecentInteractions;
-- truncate table recent_interactions;
select * from recent_interactions order by last_interaction_time desc;

 
delimiter //
create procedure updateRecentInteractions(ownerId bigint, contactId bigint, lastInteractionTime datetime, interactionType varchar(30), lastMessage text)
begin
	INSERT INTO recent_interactions (owner_id, contact_id, last_interaction_time, type, last_message)
	VALUES (ownerId, contactId, lastInteractionTime, interactionType, lastMessage)
	ON DUPLICATE KEY UPDATE
		last_interaction_time = lastInteractionTime,
		type = interactionType,
        last_message = lastMessage;
end //
delimiter ;

drop procedure if exists newInteraction;
delimiter //
create procedure newInteraction(ownerId bigint, contactId bigint, lastInteractionTime datetime, interactionType varchar(30), lastMessage text)
begin
	call updateRecentInteractions(ownerId, contactId, lastInteractionTime, interactionType, lastMessage);
    call updateRecentInteractions(contactId, ownerId, lastInteractionTime, interactionType, lastMessage);
end //
delimiter ;

drop procedure if exists addContact;

delimiter //
create procedure addContact(ownerId bigint, contactId bigint, nick varchar(30))
begin
	insert into contacts (owner_id, contact_id, nickname) values (ownerId, contactId, nick)
    on duplicate key update
		nickname = nick;
end //
delimiter ;


drop procedure if exists getContacts;

DELIMITER //

CREATE PROCEDURE getContacts(IN userId BIGINT)
BEGIN
    SELECT 
        r.contact_id, 
        r.last_interaction_time, 
        r.type, 
        r.last_message, 
        IFNULL(m.unread, 0) AS unread
    FROM 
        recent_interactions r
    LEFT JOIN (
        SELECT 
            sender, 
            COUNT(*) AS unread
        FROM 
            messages
        WHERE 
            tick IN (1, 2)
            AND reciver = userId
        GROUP BY 
            sender
    ) m ON r.contact_id = m.sender
    WHERE 
        r.owner_id = userId
    ORDER BY 
        r.last_interaction_time DESC;
END //

DELIMITER ;


-- auth refresh token
drop procedure if exists new_refresh_token;
delimiter //
create procedure new_refresh_token(token char(64), user_id bigint, expiry_in_day int)
begin
	if expiry_in_day < 1 then
		set expiry_in_day = 1;
	end if;
	insert into refresh_tokens ( token, user_id, expires_at ) value (token, user_id, date_add(now(), interval expiry_in_day day));
end //
delimiter ;

-- procudure for delete specific refresh_token
drop procedure if exists delete_refresh_token;
delimiter //
create procedure delete_refresh_token(refresh_token char(64))
begin
	delete from refresh_tokens where token = refresh_token;
end //
delimiter ;

drop procedure if exists get_refresh_token_info;
delimiter //
create procedure get_refresh_token_info(refresh_token char(64))
begin
	select * from refresh_tokens where token = refresh_token;
end //
delimiter ;







-- its simple documentation
-- call newInteraction(2, 1, current_timestamp(), 'added', null); -- call in message send, recive, add contact 
 call getContacts(1); -- call to get all contacts in order by last interaction desc
-- call addContact(1, 10, "Vai"); -- call to add contact with a nickname

-- auth related 
-- call new_refresh_token(token char(64), user_id bigint, expiry_in_day int) -- insert new refresh_token
-- call delete_refresh_token(refresh_token char(64)) -- delete refresh token

## its to hardddddddddd 😩😵‍💫😩🤯

