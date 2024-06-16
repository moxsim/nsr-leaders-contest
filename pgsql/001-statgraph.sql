SET search_path TO srv213918_pgsql;

DO $$
BEGIN
   IF NOT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'nsr') THEN
      EXECUTE 'CREATE SCHEMA nsr';
   END IF;
END$$;

DO $$
BEGIN
    DROP TABLE IF EXISTS nsr.t_statgraph_edges;
    
    CREATE TABLE nsr.t_statgraph_edges(
    	 id INTEGER NOT NULL
    	,start_point_id INTEGER NOT NULL
    	,end_point_id INTEGER NOT NULL
    	,length FLOAT NOT NULL
    	,rep_id INTEGER NOT NULL
    	,status INTEGER NOT NULL
    );

END$$;

DO $$
BEGIN
    DROP TABLE IF EXISTS nsr.t_statgraph_points;
    
    CREATE TABLE nsr.t_statgraph_points(
    	 id INTEGER NOT NULL
    	,latitude FLOAT NOT NULL
    	,longitude FLOAT NOT NULL
    	,point_name varchar(256) NOT NULL
    	,rep_id INTEGER NULL
    );
END$$;


DO $$
BEGIN

    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (0, 44, 15, 270.0166416, 54, 1);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (1, 10, 11, 277.1898363, 102, 1);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (2, 18, 39, 58.39035132, 108, 2);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (3, 13, 16, 238.8589885, 10, 2);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (4, 10, 13, 86.93004916, 8, 2);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (5, 21, 5, 655.3557374, 1, 1);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (6, 4, 5, 410.5701116, 114, 1);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (7, 45, 37, 119.5634492, 48, 1);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (8, 13, 7, 206.8821279, 15, 2);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (9, 9, 24, 191.1526107, 26, 2);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (10, 27, 18, 178.645412, 45, 2);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (11, 28, 33, 205.7748943, 40, 2);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (12, 40, 22, 134.3049847, 32, 2);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (13, 42, 30, 174.3916815, 35, 2);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (14, 31, 3, 81.8159608, 107, 2);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (15, 0, 43, 123.6831421, 13, 2);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (16, 12, 24, 246.2458649, 28, 2);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (17, 12, 42, 339.778226, 30, 2);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (18, 15, 2, 270.5921169, 5, 1);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (19, 10, 35, 127.6546236, 103, 1);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (20, 9, 32, 140.7360068, 105, 2);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (21, 2, 3, 278.1227556, 53, 1);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (22, 0, 1, 251.8626597, 104, 1);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (23, 33, 18, 225.0238977, 41, 2);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (24, 40, 42, 152.2019466, 31, 2);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (25, 4, 41, 288.1919175, 113, 1);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (26, 8, 12, 121.8205679, 24, 2);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (27, 2, 29, 315.3047628, 3, 1);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (28, 15, 3, 69.16861273, 55, 1);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (29, 12, 40, 234.8941148, 29, 2);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (30, 19, 8, 47.63018916, 23, 2);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (31, 28, 30, 308.4151996, 39, 2);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (32, 13, 0, 77.9639623, 12, 2);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (33, 21, 2, 445.9281382, 4, 1);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (34, 30, 18, 436.2716913, 38, 2);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (35, 40, 9, 229.4577372, 27, 2);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (36, 21, 4, 297.1508085, 2, 1);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (37, 16, 34, 296.3206745, 60, 2);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (38, 45, 17, 373.6308274, 46, 2);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (39, 17, 18, 281.0870454, 44, 2);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (40, 18, 26, 98.81552937, 109, 2);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (41, 38, 46, 460.2848327, 110, 1);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (42, 30, 33, 260.5701136, 37, 2);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (43, 24, 22, 179.7422785, 33, 2);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (44, 10, 16, 263.6393465, 9, 2);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (45, 27, 45, 355.6231614, 47, 2);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (46, 7, 36, 157.6035239, 19, 2);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (47, 7, 20, 192.4522229, 18, 2);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (48, 34, 13, 215.0532376, 61, 2);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (49, 43, 36, 223.5714878, 20, 2);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (50, 6, 7, 352.936821, 58, 2);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (51, 10, 25, 108.6630553, 101, 1);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (52, 37, 38, 414.6912251, 49, 1);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (53, 13, 15, 410.4549185, 7, 2);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (54, 7, 16, 260.1771091, 16, 2);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (55, 6, 16, 171.4172136, 57, 2);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (56, 36, 19, 116.7439955, 21, 2);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (57, 33, 23, 261.600589, 36, 2);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (58, 20, 16, 409.3111575, 17, 2);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (59, 10, 15, 326.4328417, 6, 2);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (60, 34, 15, 195.7328443, 59, 2);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (61, 44, 2, 156.0644819, 52, 1);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (62, 14, 0, 45.6421557, 106, 1);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (63, 8, 9, 206.5979139, 25, 2);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (64, 2, 5, 456.2676239, 111, 1);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (65, 16, 21, 145.1826364, 11, 1);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (66, 27, 28, 275.6604549, 42, 2);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (67, 13, 43, 130.3081116, 14, 2);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (68, 19, 20, 58.95750201, 22, 2);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (69, 6, 15, 280.7806599, 56, 2);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (70, 2, 41, 227.2269304, 112, 1);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (71, 22, 23, 124.9092209, 34, 2);
    INSERT INTO nsr.t_statgraph_edges (id, start_point_id, end_point_id, length, rep_id, status) VALUES (72, 17, 28, 285.0795135, 43, 2);

    INSERT INTO nsr.t_statgraph_points (id, latitude, longitude, point_name, rep_id) VALUES (0, 73.1, 80, 'Бухта Север и Диксон', 1010);
    INSERT INTO nsr.t_statgraph_points (id, latitude, longitude, point_name, rep_id) VALUES (1, 69.4, 86.15, 'Дудинка', 1007);
    INSERT INTO nsr.t_statgraph_points (id, latitude, longitude, point_name, rep_id) VALUES (2, 69.9, 44.6, 'кромка льда на Западе', 2002);
    INSERT INTO nsr.t_statgraph_points (id, latitude, longitude, point_name, rep_id) VALUES (3, 69.15, 57.68, 'Варандей-Приразломное', 1015);
    INSERT INTO nsr.t_statgraph_points (id, latitude, longitude, point_name, rep_id) VALUES (4, 73, 44, 'Штокман', 1012);
    INSERT INTO nsr.t_statgraph_points (id, latitude, longitude, point_name, rep_id) VALUES (5, 71.5, 22, 'Окно в Европу', 2001);
    INSERT INTO nsr.t_statgraph_points (id, latitude, longitude, point_name, rep_id) VALUES (6, 74.6, 63.9, 'Победа месторождение', 1011);
    INSERT INTO nsr.t_statgraph_points (id, latitude, longitude, point_name, rep_id) VALUES (7, 76.4, 86.4, 'Карское - 3 (центр)', 2008);
    INSERT INTO nsr.t_statgraph_points (id, latitude, longitude, point_name, rep_id) VALUES (8, 77.6, 107.7, 'пролив Вилькицкого - 3', 2013);
    INSERT INTO nsr.t_statgraph_points (id, latitude, longitude, point_name, rep_id) VALUES (9, 74.9, 116.7, 'Лаптевых - 4 (юг)', 2018);
    INSERT INTO nsr.t_statgraph_points (id, latitude, longitude, point_name, rep_id) VALUES (10, 73.1, 72.7, 'Вход в Обскую губу', 2009);
    INSERT INTO nsr.t_statgraph_points (id, latitude, longitude, point_name, rep_id) VALUES (11, 68.5, 73.7, 'Новый порт', 1004);
    INSERT INTO nsr.t_statgraph_points (id, latitude, longitude, point_name, rep_id) VALUES (12, 76.75, 116, 'Лаптевых - 1 (центр)', 2015);
    INSERT INTO nsr.t_statgraph_points (id, latitude, longitude, point_name, rep_id) VALUES (13, 74, 76.7, 'Карское - 1 (сбор каравана)', 2006);
    INSERT INTO nsr.t_statgraph_points (id, latitude, longitude, point_name, rep_id) VALUES (14, 72.35, 79.6, 'Лескинское м-е', 1014);
    INSERT INTO nsr.t_statgraph_points (id, latitude, longitude, point_name, rep_id) VALUES (15, 70.3, 57.8, 'Карские ворота', 2005);
    INSERT INTO nsr.t_statgraph_points (id, latitude, longitude, point_name, rep_id) VALUES (16, 77.3, 67.7, 'Мыс Желания', 2003);
    INSERT INTO nsr.t_statgraph_points (id, latitude, longitude, point_name, rep_id) VALUES (17, 71.74, 184.7, 'остров Врангеля', 2026);
    INSERT INTO nsr.t_statgraph_points (id, latitude, longitude, point_name, rep_id) VALUES (18, 70.7, 170.5, 'Восточно-Сибирское - 1 (восток)', 2023);
    INSERT INTO nsr.t_statgraph_points (id, latitude, longitude, point_name, rep_id) VALUES (19, 77.8, 104.1, 'пролив Вилькицкого - восток', 2012);
    INSERT INTO nsr.t_statgraph_points (id, latitude, longitude, point_name, rep_id) VALUES (20, 77.7, 99.5, 'пролив Вилькицкого - запад', 2011);
    INSERT INTO nsr.t_statgraph_points (id, latitude, longitude, point_name, rep_id) VALUES (21, 76.2, 58.3, 'около Новой Земли', 2004);
    INSERT INTO nsr.t_statgraph_points (id, latitude, longitude, point_name, rep_id) VALUES (22, 74.4, 139, 'Пролив Санникова - 1', 2020);
    INSERT INTO nsr.t_statgraph_points (id, latitude, longitude, point_name, rep_id) VALUES (23, 74.3, 146.7, 'Пролив Санникова - 2', 2021);
    INSERT INTO nsr.t_statgraph_points (id, latitude, longitude, point_name, rep_id) VALUES (24, 74, 128.1, 'устье Лены', 2019);
    INSERT INTO nsr.t_statgraph_points (id, latitude, longitude, point_name, rep_id) VALUES (25, 71.3, 72.15, 'Сабетта', 1003);
    INSERT INTO nsr.t_statgraph_points (id, latitude, longitude, point_name, rep_id) VALUES (26, 69.1, 169.4, 'мыс.Наглёйнын', 1009);
    INSERT INTO nsr.t_statgraph_points (id, latitude, longitude, point_name, rep_id) VALUES (27, 69.9, 179, 'пролив Лонга', 2027);
    INSERT INTO nsr.t_statgraph_points (id, latitude, longitude, point_name, rep_id) VALUES (28, 73.5, 169.9, 'Восточно-Сибирское - 3 (север)', 2025);
    INSERT INTO nsr.t_statgraph_points (id, latitude, longitude, point_name, rep_id) VALUES (29, 64.95, 40.05, 'Архангельск', 1002);
    INSERT INTO nsr.t_statgraph_points (id, latitude, longitude, point_name, rep_id) VALUES (30, 75.9, 152.6, 'Лаптевых - 3 (восток)', 2017);
    INSERT INTO nsr.t_statgraph_points (id, latitude, longitude, point_name, rep_id) VALUES (31, 68.37, 54.6, 'МОТ Печора', 1017);
    INSERT INTO nsr.t_statgraph_points (id, latitude, longitude, point_name, rep_id) VALUES (32, 73.7, 109.26, 'Хатангский залив', 1008);
    INSERT INTO nsr.t_statgraph_points (id, latitude, longitude, point_name, rep_id) VALUES (33, 72, 159.5, 'Восточно-Сибирское - 2 (запад)', 2024);
    INSERT INTO nsr.t_statgraph_points (id, latitude, longitude, point_name, rep_id) VALUES (34, 72.4, 65.6, 'Ленинградское-Русановское', 1013);
    INSERT INTO nsr.t_statgraph_points (id, latitude, longitude, point_name, rep_id) VALUES (35, 71, 73.73, 'терминал Утренний', 1005);
    INSERT INTO nsr.t_statgraph_points (id, latitude, longitude, point_name, rep_id) VALUES (36, 76.5, 97.6, 'Таймырский залив', 2010);
    INSERT INTO nsr.t_statgraph_points (id, latitude, longitude, point_name, rep_id) VALUES (37, 64.2, 188.2, 'Берингово', 2029);
    INSERT INTO nsr.t_statgraph_points (id, latitude, longitude, point_name, rep_id) VALUES (38, 60.7, 175.3, 'кромка льда на Востоке', 2030);
    INSERT INTO nsr.t_statgraph_points (id, latitude, longitude, point_name, rep_id) VALUES (39, 69.75, 169.9, 'Рейд Певек', 1006);
    INSERT INTO nsr.t_statgraph_points (id, latitude, longitude, point_name, rep_id) VALUES (40, 75.5, 131.5, 'Лаптевых - 2 (центр)', 2016);
    INSERT INTO nsr.t_statgraph_points (id, latitude, longitude, point_name, rep_id) VALUES (41, 69.5, 33.75, 'Рейд Мурманска', 1001);
    INSERT INTO nsr.t_statgraph_points (id, latitude, longitude, point_name, rep_id) VALUES (42, 76.7, 140.8, 'остров Котельный', 2022);
    INSERT INTO nsr.t_statgraph_points (id, latitude, longitude, point_name, rep_id) VALUES (43, 74.8, 84.2, 'Карское - 2 (прибрежный)', 2007);
    INSERT INTO nsr.t_statgraph_points (id, latitude, longitude, point_name, rep_id) VALUES (44, 67.58, 47.82, 'Индига', 1016);
    INSERT INTO nsr.t_statgraph_points (id, latitude, longitude, point_name, rep_id) VALUES (45, 65.9, 360 + (-169.35), 'Берингов пролив', 2028);
    INSERT INTO nsr.t_statgraph_points (id, latitude, longitude, point_name, rep_id) VALUES (46, 55.7, 164.25, 'Окно в Азию', 2031);

    UPDATE nsr.t_statgraph_points SET 
        id = id + 1
    ;

    UPDATE nsr.t_statgraph_edges SET 
         id = id + 1
        ,start_point_id = start_point_id + 1
        ,end_point_id = end_point_id + 1
    ;

END$$;

