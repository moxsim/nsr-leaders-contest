DO $$
BEGIN
   IF NOT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'nsr') THEN
      EXECUTE 'CREATE SCHEMA nsr';
   END IF;
END$$;

DROP VIEW IF EXISTS nsr.v_tasks_ships;
DROP VIEW IF EXISTS nsr.v_tasks_icebreakers;

------------------------------------------
-- Cправочник типов льда
------------------------------------------
DROP TABLE IF EXISTS nsr.t_dict_ice_type;
CREATE TABLE nsr.t_dict_ice_type (
     id SMALLINT NOT NULL PRIMARY KEY
    ,color CHAR(7) NULL
    ,passab SMALLINT NOT NULL
    ,speed NUMERIC NOT NULL 
    ,thick VARCHAR(32)
    ,name VARCHAR(64) 
    ,name_r VARCHAR(64)
);

INSERT INTO nsr.t_dict_ice_type (ID, COLOR, PASSAB, SPEED, THICK, NAME, NAME_R) VALUES (01, '#555555', 0, 0.00, NULL, 'mainland', 'материк');
INSERT INTO nsr.t_dict_ice_type (ID, COLOR, PASSAB, SPEED, THICK, NAME, NAME_R) VALUES (02, '#555555', 0, 0.00, NULL, 'islands, underwater rocks', 'острова, подводные скалы');
INSERT INTO nsr.t_dict_ice_type (ID, COLOR, PASSAB, SPEED, THICK, NAME, NAME_R) VALUES (03, '#555555', 0, 0.00, NULL, 'shipwrecks and other', 'затонувшие суда и проч.');
INSERT INTO nsr.t_dict_ice_type (ID, COLOR, PASSAB, SPEED, THICK, NAME, NAME_R) VALUES (04, '#555555', 0, 0.00, NULL, 'shoals, shallow depths', 'мели, малые глубины');
INSERT INTO nsr.t_dict_ice_type (ID, COLOR, PASSAB, SPEED, THICK, NAME, NAME_R) VALUES (05, '#555555', 0, 0.00, NULL, 'drilling platform', 'буровые платформы');
INSERT INTO nsr.t_dict_ice_type (ID, COLOR, PASSAB, SPEED, THICK, NAME, NAME_R) VALUES (06, '#555555', 0, 0.00, NULL, 'underwater pipeline', 'подводный трубопровод');
INSERT INTO nsr.t_dict_ice_type (ID, COLOR, PASSAB, SPEED, THICK, NAME, NAME_R) VALUES (07, '#555555', 0, 0.00, NULL, 'reserve', 'резерв');
INSERT INTO nsr.t_dict_ice_type (ID, COLOR, PASSAB, SPEED, THICK, NAME, NAME_R) VALUES (08, '#555555', 0, 0.00, NULL, 'reserve', 'резерв');
INSERT INTO nsr.t_dict_ice_type (ID, COLOR, PASSAB, SPEED, THICK, NAME, NAME_R) VALUES (09, '#555555', 0, 0.00, NULL, 'restrictrd area', 'запретная зона');
INSERT INTO nsr.t_dict_ice_type (ID, COLOR, PASSAB, SPEED, THICK, NAME, NAME_R) VALUES (10, '#555555', 0, 0.00, NULL, 'glacier tongue', 'язык ледника');
INSERT INTO nsr.t_dict_ice_type (ID, COLOR, PASSAB, SPEED, THICK, NAME, NAME_R) VALUES (11, '#555555', 0, 0.00, NULL, 'shelf ice', 'шельфовый лёд');
INSERT INTO nsr.t_dict_ice_type (ID, COLOR, PASSAB, SPEED, THICK, NAME, NAME_R) VALUES (12, '#555555', 0, 0.00, NULL, 'ice barrier', 'ледяной барьер');
INSERT INTO nsr.t_dict_ice_type (ID, COLOR, PASSAB, SPEED, THICK, NAME, NAME_R) VALUES (13, '#555555', 0, 0.00, NULL, 'iceberg', 'айсберг');
INSERT INTO nsr.t_dict_ice_type (ID, COLOR, PASSAB, SPEED, THICK, NAME, NAME_R) VALUES (14, '#eeeeee', 0, 0.00, NULL, 'ice floe', 'ледяной дрейфующий остров');
INSERT INTO nsr.t_dict_ice_type (ID, COLOR, PASSAB, SPEED, THICK, NAME, NAME_R) VALUES (15, '#555555', 0, 0.00, NULL, 'grouded hummock', 'стамуха');
INSERT INTO nsr.t_dict_ice_type (ID, COLOR, PASSAB, SPEED, THICK, NAME, NAME_R) VALUES (16, '#555555', 0, 0.00, NULL, 'hummocks', 'торосы');
INSERT INTO nsr.t_dict_ice_type (ID, COLOR, PASSAB, SPEED, THICK, NAME, NAME_R) VALUES (17, '#555555', 0, 0.00, NULL, 'floeberg', 'несяк');
INSERT INTO nsr.t_dict_ice_type (ID, COLOR, PASSAB, SPEED, THICK, NAME, NAME_R) VALUES (18, '#555555', 0, 0.00, NULL, 'smoroz', 'сморозь');
INSERT INTO nsr.t_dict_ice_type (ID, COLOR, PASSAB, SPEED, THICK, NAME, NAME_R) VALUES (19, '#555555', 0, 0.00, NULL, 'reserve', 'резерв');
INSERT INTO nsr.t_dict_ice_type (ID, COLOR, PASSAB, SPEED, THICK, NAME, NAME_R) VALUES (20, '#00ffff', 900, 0.00, '===0===', 'open water', 'чистая вода');
INSERT INTO nsr.t_dict_ice_type (ID, COLOR, PASSAB, SPEED, THICK, NAME, NAME_R) VALUES (21, '#f0d2fa', 800, 0.00, ' <10 cm', 'nilas', 'нилас');
INSERT INTO nsr.t_dict_ice_type (ID, COLOR, PASSAB, SPEED, THICK, NAME, NAME_R) VALUES (22, '#873cd7', 700, 0.00, '10-15 cm', 'young-thin', 'молодой тонкий');
INSERT INTO nsr.t_dict_ice_type (ID, COLOR, PASSAB, SPEED, THICK, NAME, NAME_R) VALUES (23, '#dc50eb', 600, 0.00, '15-30 cm', 'young', 'молодой');
INSERT INTO nsr.t_dict_ice_type (ID, COLOR, PASSAB, SPEED, THICK, NAME, NAME_R) VALUES (24, '#9bd200', 500, 0.00, '30-70 cm', 'first-year-thin', 'тонкий 1-летн.');
INSERT INTO nsr.t_dict_ice_type (ID, COLOR, PASSAB, SPEED, THICK, NAME, NAME_R) VALUES (25, '#00c814', 400, 0.00, '70-120 cm', 'first-year-average', 'средний 1-летн.');
INSERT INTO nsr.t_dict_ice_type (ID, COLOR, PASSAB, SPEED, THICK, NAME, NAME_R) VALUES (26, '#007800', 300, 0.00, '120-200 cm', 'first-year-thick', 'толстый 1-летн.');
INSERT INTO nsr.t_dict_ice_type (ID, COLOR, PASSAB, SPEED, THICK, NAME, NAME_R) VALUES (27, '#b46432', 200, 0.00, '200-300 cm', 'two-year-old', 'двухлетний');
INSERT INTO nsr.t_dict_ice_type (ID, COLOR, PASSAB, SPEED, THICK, NAME, NAME_R) VALUES (28, '#900000', 100, 0.00, ' >300 cm', 'long-term-pack', 'многолетний, паковый');

INSERT INTO nsr.t_dict_ice_type (ID, COLOR, PASSAB, SPEED, THICK, NAME, NAME_R) VALUES (30, '#00ffff', 900, 0.00, '===0===', 'open water', 'чистая вода');
INSERT INTO nsr.t_dict_ice_type (ID, COLOR, PASSAB, SPEED, THICK, NAME, NAME_R) VALUES (31, '#9bd200', 700, 0.00, '10-50 cm', 'young-thin', 'молодой тонкий');
INSERT INTO nsr.t_dict_ice_type (ID, COLOR, PASSAB, SPEED, THICK, NAME, NAME_R) VALUES (32, '#009000', 500, 0.00, '50-120 cm', 'first-year-average', 'средний 1-летн.');
INSERT INTO nsr.t_dict_ice_type (ID, COLOR, PASSAB, SPEED, THICK, NAME, NAME_R) VALUES (33, '#900000', 300, 0.00, ' >120 cm', 'first-year-thick', 'толстый 1-летн.');

INSERT INTO nsr.t_dict_ice_type (ID, COLOR, PASSAB, SPEED, THICK, NAME, NAME_R) VALUES (99, '#eeeeee', 300, 0.00, '//////////', 'fast', 'припай');

------------------------------------------
-- Cправочник направлений от точки
------------------------------------------
DROP TABLE IF EXISTS nsr.t_dict_direction;
CREATE TABLE nsr.t_dict_direction (
     x_offset SMALLINT NOT NULL
    ,y_offset SMALLINT NOT NULL
    ,is_diagonal SMALLINT NOT NULL -- Если смещение в диагональную точку, то 1, если вверх|вниз|вправо|влево то 0
);

INSERT INTO nsr.t_dict_direction (x_offset, y_offset, is_diagonal) VALUES (-1,-1,1);
INSERT INTO nsr.t_dict_direction (x_offset, y_offset, is_diagonal) VALUES (+0,-1,0);
INSERT INTO nsr.t_dict_direction (x_offset, y_offset, is_diagonal) VALUES (+1,-1,1);
------------------------------------------------------------------------------------
INSERT INTO nsr.t_dict_direction (x_offset, y_offset, is_diagonal) VALUES (-1,+0,0);
-- INSERT INTO nsr.t_dict_direction (x_offset, y_offset, is_diagonal) VALUES (+0,+0,NULL); -- Центр, это сама точка
INSERT INTO nsr.t_dict_direction (x_offset, y_offset, is_diagonal) VALUES (+1,+0,0);
------------------------------------------------------------------------------------
INSERT INTO nsr.t_dict_direction (x_offset, y_offset, is_diagonal) VALUES (-1,+1,1);
INSERT INTO nsr.t_dict_direction (x_offset, y_offset, is_diagonal) VALUES (+0,+1,0);
INSERT INTO nsr.t_dict_direction (x_offset, y_offset, is_diagonal) VALUES (+1,+1,1);


------------------------------------------
-- Cправочник Классов Льда
------------------------------------------
DROP TABLE IF EXISTS nsr.t_dict_ice_class;
CREATE TABLE nsr.t_dict_ice_class (
     ice_class_id SMALLINT PRIMARY KEY
    ,ice_class_name VARCHAR(64) NOT NULL
);

INSERT INTO nsr.t_dict_ice_class (ice_class_id, ice_class_name) VALUES (1, 'Вода');
INSERT INTO nsr.t_dict_ice_class (ice_class_id, ice_class_name) VALUES (2, 'Средний лёд');
INSERT INTO nsr.t_dict_ice_class (ice_class_id, ice_class_name) VALUES (3, 'Тяжёлый лёд');
INSERT INTO nsr.t_dict_ice_class (ice_class_id, ice_class_name) VALUES (0, 'Плавать нельзя (Супертяжёлый лёд/Земля/Запрет)');

------------------------------------------
-- Cправочник Классов Судов
------------------------------------------
DROP TABLE IF EXISTS nsr.t_dict_arc_class;
CREATE TABLE nsr.t_dict_arc_class (
     arc_class_id SMALLINT PRIMARY KEY
    ,arc_class_name VARCHAR(32) NOT NULL
    ,ice_class_id SMALLINT NOT NULL -- максимальный класс льда по которму можно ходить без проводки
    ,escort_ice_class_id SMALLINT NOT NULL -- максимальный класс льда по которму можно ходить с проводкой
);
INSERT INTO nsr.t_dict_arc_class (arc_class_id, arc_class_name, ice_class_id, escort_ice_class_id) VALUES (0, 'No ice', 1, 3); -- 2 
INSERT INTO nsr.t_dict_arc_class (arc_class_id, arc_class_name, ice_class_id, escort_ice_class_id) VALUES (1, 'Ice 1', 1, 3); -- 2
INSERT INTO nsr.t_dict_arc_class (arc_class_id, arc_class_name, ice_class_id, escort_ice_class_id) VALUES (2, 'Ice 2', 1, 3); -- 2
INSERT INTO nsr.t_dict_arc_class (arc_class_id, arc_class_name, ice_class_id, escort_ice_class_id) VALUES (3, 'Ice 3', 1, 3); -- 2
INSERT INTO nsr.t_dict_arc_class (arc_class_id, arc_class_name, ice_class_id, escort_ice_class_id) VALUES (4, 'Arc 4', 1, 3);
INSERT INTO nsr.t_dict_arc_class (arc_class_id, arc_class_name, ice_class_id, escort_ice_class_id) VALUES (5, 'Arc 5', 1, 3);
INSERT INTO nsr.t_dict_arc_class (arc_class_id, arc_class_name, ice_class_id, escort_ice_class_id) VALUES (6, 'Arc 6', 1, 3);
INSERT INTO nsr.t_dict_arc_class (arc_class_id, arc_class_name, ice_class_id, escort_ice_class_id) VALUES (7, 'Arc 7', 3, 3);
INSERT INTO nsr.t_dict_arc_class (arc_class_id, arc_class_name, ice_class_id, escort_ice_class_id) VALUES (9, 'Arc 9', 3, 3);



