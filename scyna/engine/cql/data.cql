USE scyna2;

insert into module(code,secret) values ( 'scyna_engine', '123456');
insert into module(code,secret) values ( 'scyna_test', '123456');
insert into module(code,secret) values ( 'scyna_manager', '123456');
insert into client(id, secret, active) VALUES ('admin', 'admin', true);
