
drop procedure updateRecentInteractions;
delimiter //
create procedure updateRecentInteractions(OUT a char(3))
begin
	set a = 'o';
end //
delimiter ;

call updateRecentInteractions(@o);