SET search_path TO srv213918_pgsql;

DROP VIEW IF EXISTS nsr.v_tasks_transponse_icebreaker;
DROP VIEW IF EXISTS nsr.v_tasks_transponse_schedule;
DROP VIEW IF EXISTS nsr.v_tasks_transponse_icedata;
DROP VIEW IF EXISTS nsr.v_tasks_transponse_coordinates;
DROP VIEW IF EXISTS nsr.v_tasks_transponse_icetype;

DROP VIEW IF EXISTS nsr.v_tasks_ships;
DROP VIEW IF EXISTS nsr.v_tasks_icebreakers;
DROP VIEW IF EXISTS nsr.v_ice_statgraph_edges;
DROP VIEW IF EXISTS nsr.v_ice_statgraph_points;
DROP VIEW IF EXISTS nsr.v_ice_graph;
DROP VIEW IF EXISTS nsr.v_ice_values;
DROP VIEW IF EXISTS nsr.v_ice_coords;

------------------------
-- Сырые данные
------------------------
DROP VIEW IF EXISTS nsr.v_tasks_data_raw;
CREATE VIEW nsr.v_tasks_data_raw AS
SELECT 
    tRow.task_id,
    tRow.sheet,    
    tRow.row,
    tRow.col,
    tCol.id AS col_id,
    tRow.val_string,
    tRow.val_int,
    tRow.val_float,    
    tRow.string_id,
    tRow.type,
    tString.string_name
FROM nsr.t_tasks_data_raw AS tRow
INNER JOIN nsr.t_dict_column_codes AS tCol
    ON tCol.code = tRow.col
LEFT JOIN nsr.t_tasks_data_strings AS tString
    ON tRow.task_id = tString.task_id
    AND tRow.string_id = tString.string_id
;

------------------------------------------
-- Ледоколы
------------------------------------------
/*
     'A' => 'Название судна'
    ,'B' => 'Скорость, узлы (по чистой воде)'
    ,'C' => 'Ледовый класс'
    ,'D' => 'Пункт начала плавания'
    ,'E' => 'Дата начала плавания'
*/
DROP VIEW IF EXISTS nsr.v_tasks_transponse_icebreaker;
CREATE VIEW nsr.v_tasks_transponse_icebreaker AS
SELECT 
     tRow.task_id
    ,tRow.sheet
    ,tRow.row
    ,tA.string_name AS ship_name -- 'A' => 'Название судна'
    ,CASE 
        WHEN tB.string_name IN ('Нет','No ice class') THEN NULL
        ELSE tB.string_name 
    END AS ship_arc_class -- 'B' => 'Ледовый класс'
    ,tC.val_float AS ship_speed -- 'C' => 'Скорость, узлы (по чистой воде)'
    ,tD.string_name AS start_point_name
    ,tPointStart.id AS start_point_id -- 'D' => 'Пункт начала плавания'
   ,(DATE '1900-01-01' + INTERVAL '1 day' * (tE.val_int - 2))::DATE  AS start_date-- 'E' => 'Дата начала плавания'
FROM nsr.t_tasks_data_row AS tRow
LEFT JOIN nsr.v_tasks_data_raw AS tA
    ON tRow.task_id = tA.task_id
    AND tRow.sheet = tA.sheet
    AND tRow.row = tA.row
    AND tA.col = 'A'
LEFT JOIN nsr.v_tasks_data_raw AS tB
    ON tRow.task_id = tB.task_id
    AND tRow.sheet = tB.sheet
    AND tRow.row = tB.row
    AND tB.col = 'B'
LEFT JOIN nsr.v_tasks_data_raw AS tC
    ON tRow.task_id = tC.task_id
    AND tRow.sheet = tC.sheet
    AND tRow.row = tC.row
    AND tC.col = 'C'   
LEFT JOIN nsr.v_tasks_data_raw AS tD
    ON tRow.task_id = tD.task_id
    AND tRow.sheet = tD.sheet    
    AND tRow.row = tD.row
    AND tD.col = 'D' 
LEFT JOIN nsr.v_tasks_data_raw AS tE
    ON tRow.task_id = tE.task_id
    AND tRow.sheet = tE.sheet
    AND tRow.row = tE.row
    AND tE.col = 'E'      
LEFT JOIN nsr.t_statgraph_points AS tPointStart
    ON tPointStart.point_name ILIKE tD.string_name
WHERE 1 = 1
    AND tRow.sheet = 2
;

------------------------------------------
-- Расписание судоходства
------------------------------------------
/*
     'A' => 'Название судна'
    ,'B' => 'Ледовый класс'
    ,'C' => 'Скорость, узлы (по чистой воде)'
    ,'D' => 'Пункт начала плавания'
    ,'E' => 'Пункт окончания плавания'
    ,'F' => 'Дата начала плавания'
*/

DROP VIEW IF EXISTS nsr.v_tasks_transponse_schedule;
CREATE VIEW nsr.v_tasks_transponse_schedule AS
SELECT 
     tRow.task_id
    ,tRow.sheet
    ,tRow.row
    ,tA.string_name AS ship_name -- 'A' => 'Название судна'
    ,CASE 
        WHEN tB.string_name IN ('Нет','') THEN 'No ice class'
        ELSE tB.string_name 
    END AS ship_arc_class -- 'B' => 'Ледовый класс'
    ,tC.val_float AS ship_speed -- 'C' => 'Скорость, узлы (по чистой воде)'
    ,tD.string_name AS start_point_name
    ,tPointStart.id AS start_point_id  -- 'D' => 'Пункт начала плавания'
    ,tE.string_name AS end_point_name
    ,tPointEnd.id AS end_point_id  -- 'E' => 'Пункт окончания плавания'
    ,(DATE '1900-01-01' + INTERVAL '1 day' * (tF.val_int - 2))::DATE AS start_date -- 'F' => 'Дата начала плавания'
FROM nsr.t_tasks_data_row AS tRow
LEFT JOIN nsr.v_tasks_data_raw AS tA
    ON tRow.task_id = tA.task_id
    AND tRow.sheet = tA.sheet
    AND tRow.row = tA.row
    AND tA.col = 'A'
LEFT JOIN nsr.v_tasks_data_raw AS tB
    ON tRow.task_id = tB.task_id
    AND tRow.sheet = tB.sheet
    AND tRow.row = tB.row
    AND tB.col = 'B'
LEFT JOIN nsr.v_tasks_data_raw AS tC
    ON tRow.task_id = tC.task_id
    AND tRow.sheet = tC.sheet
    AND tRow.row = tC.row
    AND tC.col = 'C'   
LEFT JOIN nsr.v_tasks_data_raw AS tD
    ON tRow.task_id = tD.task_id
    AND tRow.sheet = tD.sheet    
    AND tRow.row = tD.row
    AND tD.col = 'D' 
LEFT JOIN nsr.v_tasks_data_raw AS tE
    ON tRow.task_id = tE.task_id
    AND tRow.sheet = tE.sheet
    AND tRow.row = tE.row
    AND tE.col = 'E'      
LEFT JOIN nsr.t_statgraph_points AS tPointStart
    ON tPointStart.point_name ILIKE tD.string_name -- сравнение без учёта регистра
LEFT JOIN nsr.t_statgraph_points AS tPointEnd
    ON tPointEnd.point_name ILIKE tE.string_name -- сравнение без учёта регистра
LEFT JOIN nsr.v_tasks_data_raw AS tF
    ON tRow.task_id = tF.task_id
    AND tRow.sheet = tF.sheet
    AND tRow.row = tF.row
    AND tF.col = 'F' 
WHERE 1 = 1
    AND tRow.sheet = 1
;

--------------------------------------------
-- Координаты. Широта / Долгота
--------------------------------------------
DROP VIEW IF EXISTS nsr.v_tasks_transponse_coordinates;
CREATE VIEW nsr.v_tasks_transponse_coordinates AS
SELECT
     tLon.task_id
    ,tLon.row AS x
    ,tLon.col_id AS y
    ,tLon.val_float AS lon
    ,tLat.val_float AS lat
FROM nsr.v_tasks_data_raw AS tLon
INNER JOIN nsr.v_tasks_data_raw AS tLat
    ON tLat.task_id = tLon.task_id
    AND tLon.sheet = 3
    AND tLat.sheet = 4
    AND tLat.row = tLon.row
    AND tLat.col_id = tLon.col_id
WHERE 1 = 1
    AND tLon.sheet = 3
;

--------------------------------------------
-- Тип льда
--------------------------------------------
DROP VIEW IF EXISTS nsr.v_tasks_transponse_icetype;
CREATE VIEW nsr.v_tasks_transponse_icetype AS
SELECT
    tRaw.task_id 
    ,tRaw.sheet
    ,tSheet.dt
    ,tRaw.row AS x
    ,tRaw.col_id AS y
    ,tRaw.val_float AS value
FROM nsr.v_tasks_data_raw AS tRaw
INNER JOIN nsr.t_tasks_data_sheets AS tSheet
    ON tSheet.task_id  = tRaw.task_id 
    AND tSheet.sheet_id = tRaw.sheet 
    AND tSheet.dt IS NOT NULL
;



CREATE OR REPLACE FUNCTION nsr.fnc_velocity_to_ice_class_id(velocity FLOAT)
RETURNS SMALLINT AS $$
BEGIN
--------------------------------------------------------------------------------
-- Функция преобразования velocity в ice_class_id -> nsr.t_dict_ice_class
--------------------------------------------------------------------------------    
    IF velocity >= 19.5 THEN RETURN 1; END IF;
    IF velocity >= 14.5 THEN RETURN 2; END IF;
    IF velocity >= 10.0 THEN RETURN 3; END IF;
    RETURN 0;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION nsr.fnc_velocity_to_ice_type_id( velocity FLOAT )
RETURNS SMALLINT AS $$
BEGIN
--------------------------------------------------------------------------------
-- Функция преобразования velocity в ice_type_id -> nsr.t_dict_ice_type
--------------------------------------------------------------------------------
/*
(30, '#00ffff', 900, 0.00, '===0===', 'open water', 'чистая вода');
(31, '#9bd200', 700, 0.00, '10-50 cm', 'young-thin', 'молодой тонкий');
(32, '#009000', 500, 0.00, '50-120 cm', 'first-year-average', 'средний 1-летн.');
(33, '#900000', 300, 0.00, ' >120 cm', 'first-year-thick', 'толстый 1-летн.');
*/
    RETURN CASE
        WHEN velocity > 1.0  and velocity <= 10.0 THEN 33
        WHEN velocity > 10.0 and velocity <= 14.5 THEN 32
        WHEN velocity > 14.5 and velocity <= 19.5 THEN 31
        WHEN velocity > 19.5 THEN 30
        ELSE NULL
        END::SMALLINT; 
    
/*    
(20, '#000000', 900, 0.00, '===0===', 'open water', 'чистая вода');
(21, '#000000', 800, 0.00, ' <10 cm', 'nilas', 'нилас');
(22, '#000000', 700, 0.00, '10-15 cm', 'young-thin', 'молодой тонкий');
(23, '#000000', 600, 0.00, '15-30 cm', 'young', 'молодой');
(24, '#000000', 500, 0.00, '30-70 cm', 'first-year-thin', 'тонкий 1-летн.');
(25, '#000000', 400, 0.00, '70-120 cm', 'first-year-average', 'средний 1-летн.');
(26, '#000000', 300, 0.00, '120-200 cm', 'first-year-thick', 'толстый 1-летн.');
(27, '#000000', 200, 0.00, '200-300 cm', 'two-year-old', 'двухлетний');
(28, '#000000', 100, 0.00, ' >300 cm', 'long-term-pack', 'многолетний, паковый');
(99, '#000000', 300, 0.00, '//////////', 'fast', 'припай');
*/    
    RETURN CASE
        WHEN velocity = -10 THEN 1
        WHEN velocity >  1.0 and velocity <= 11.0 THEN 28
        WHEN velocity > 11.0 and velocity <= 12.2 THEN 27
        WHEN velocity > 12.2 and velocity <= 15.0 THEN 26
        WHEN velocity > 15.0 and velocity <= 16.5 THEN 25
        WHEN velocity > 16.5 and velocity <= 19.0 THEN 24
        WHEN velocity > 19.0 and velocity <= 20.0 THEN 23
        WHEN velocity > 20.0 and velocity <= 21.0 THEN 22
        WHEN velocity > 21.0 and velocity <= 21.7 THEN 21
        ELSE 20
        END::SMALLINT;

END;
$$ LANGUAGE plpgsql;

--------------------------------------------
-- Финальные данные
--------------------------------------------
DROP VIEW IF EXISTS nsr.v_tasks_transponse_icedata;
CREATE VIEW nsr.v_tasks_transponse_icedata AS
SELECT 
     tCoord.task_id 
    ,tCoord.x
    ,tCoord.y
    ,tCoord.lon 
    ,tCoord.lat
    ,tIceType.sheet
    ,tIceType.dt 
    ,tIceType.value
    ------------------------
    -- ОПРЕДЕЛЕНИЕ ЦВЕТОВ
    ------------------------
    ,nsr.fnc_velocity_to_ice_type_id( tIceType.value ) AS ice_type_id
    ,nsr.fnc_velocity_to_ice_class_id( tIceType.value ) AS ice_class_id
FROM nsr.v_tasks_transponse_coordinates AS tCoord
INNER JOIN nsr.v_tasks_transponse_icetype AS tIceType
    ON tIceType.task_id = tCoord.task_id 
    AND tIceType.x = tCoord.x
    AND tIceType.y = tCoord.y
;

----------------------------------------------------------
-- Данные льда
----------------------------------------------------------
DROP VIEW IF EXISTS nsr.v_ice_coords;
CREATE VIEW nsr.v_ice_coords AS
SELECT
     coord_id
    , ice_id
    ,('x' || x || 'y' || y)::VARCHAR(32) AS p_id    
    , x
    , y
    , lon
    , lat
    , is_earth
FROM nsr.t_ice_coords
;

DROP VIEW IF EXISTS nsr.v_ice_values;
CREATE VIEW nsr.v_ice_values AS
SELECT
     tCoord.coord_id
    ,tCoord.ice_id
    ,tCoord.x
    ,tCoord.y
    ,tVal.dt
    ,tVal.value 
    ,tVal.ice_type_id
    ,tVal.ice_class_id
    ,tCoord.lon
    ,tCoord.lat
FROM nsr.t_ice_values AS tVal
INNER JOIN nsr.t_ice_coords AS tCoord
    ON tCoord.coord_id = tVal.coord_id
;



----------------------------------------------------------
-- Привязки координат льда к статисческому графу
----------------------------------------------------------

DROP VIEW IF EXISTS nsr.v_ice_statgraph_points;
CREATE VIEW nsr.v_ice_statgraph_points AS
SELECT
     tIcePoint.point_id
    ,tStat.point_name 
    ,tCoord.coord_id
    ,tCoord.ice_id
    ,tCoord.p_id
    ,tCoord.x
    ,tCoord.y
    ,tCoord.lon
    ,tCoord.lat
    ,tVal.ice_class_id
FROM nsr.t_statgraph_points AS tStat
INNER JOIN nsr.t_ice_statgraph_points AS tIcePoint
    ON tStat.id = tIcePoint.point_id
INNER JOIN nsr.v_ice_coords AS tCoord
    ON tCoord.coord_id = tIcePoint.coord_id 
INNER JOIN nsr.t_ice AS tIce
    ON tIce.ice_id = tCoord.ice_id
INNER JOIN nsr.v_ice_values AS tVal
    ON tVal.coord_id = tIcePoint.coord_id 
    AND tVal.dt = tIce.first_dt
;

DROP VIEW IF EXISTS nsr.v_ice_statgraph_edges;
CREATE VIEW nsr.v_ice_statgraph_edges AS
SELECT
     tIceStart.ice_id
    ,(tIceStart.p_id || '_' || tIceEnd.p_id)::VARCHAR(64) AS edge_id
    ,tIceStart.point_name AS start_point_name
    ,tIceEnd.point_name AS end_point_name
    ,tStat.start_point_id
    ,tStat.end_point_id 
    ,tIceStart.coord_id AS start_coord_id
    ,tIceStart.p_id AS start_p_id
    ,tIceStart.x AS start_x
    ,tIceStart.y AS start_y
    ,tIceStart.lon AS start_lon
    ,tIceStart.lat AS start_lat
    ,tIceEnd.coord_id AS end_coord_id
    ,tIceEnd.p_id AS end_p_id
    ,tIceEnd.x AS end_x
    ,tIceEnd.y AS end_y
    ,tIceEnd.lon AS end_lon
    ,tIceEnd.lat AS end_lat
FROM nsr.t_statgraph_edges AS tStat
INNER JOIN nsr.v_ice_statgraph_points AS tIceStart
    ON tStat.start_point_id = tIceStart.point_id
INNER JOIN nsr.v_ice_statgraph_points AS tIceEnd
    ON tStat.end_point_id = tIceEnd.point_id
    AND tIceStart.ice_id = tIceEnd.ice_id
;

----------------------------------------------------------
-- Суда и Ледоколы
----------------------------------------------------------

DROP VIEW IF EXISTS nsr.v_tasks_ships;
CREATE VIEW nsr.v_tasks_ships AS
SELECT
     tShip.ship_id
    ,('s' || tShip.ship_id)::VARCHAR(32) AS ship_code
    ,tShip.task_id
    ,tShip.ship_name
    ,tShip.arc_class_id
    ,tShip.arc_class_input AS arc_class_name
    ,tArcClass.ice_class_id
    ,tArcClass.escort_ice_class_id
    ,tShip.speed_knot
    ,tShip.speed_kmph
    ,tShip.start_p_id
    ,tShip.start_coord_id
    ,tStartPoint.point_name AS start_point_name
    ,tStartPoint.ice_class_id AS start_ice_class_id
    ,tShip.end_p_id
    ,tShip.end_coord_id
    ,tEndPoint.point_name AS end_point_name
    ,tEndPoint.ice_class_id AS end_ice_class_id
    ,tShip.start_date
FROM nsr.t_tasks_ships AS tShip
INNER JOIN nsr.t_tasks AS tTask
    ON tTask.task_id = tShip.task_id
INNER JOIN nsr.v_ice_statgraph_points AS tStartPoint
    ON tStartPoint.ice_id = tTask.ice_id
    AND tStartPoint.coord_id = tShip.start_coord_id
INNER JOIN nsr.v_ice_statgraph_points AS tEndPoint
    ON tEndPoint.ice_id = tTask.ice_id
    AND tEndPoint.coord_id = tShip.end_coord_id
LEFT JOIN nsr.t_dict_arc_class AS tArcClass
    ON tArcClass.arc_class_id = tShip.arc_class_id
;

DROP VIEW IF EXISTS nsr.v_tasks_icebreakers;
CREATE VIEW nsr.v_tasks_icebreakers AS
SELECT
     tShip.icebreaker_id
    ,('i' || tShip.icebreaker_id)::VARCHAR(32) AS ship_code
    ,tShip.task_id
    ,tShip.ship_name
    ,tShip.arc_class_id
    ,tShip.arc_class_input AS arc_class_name
    ,tArcClass.ice_class_id
    ,tArcClass.escort_ice_class_id
    ,tShip.speed_knot
    ,tShip.speed_kmph
    ,tShip.start_p_id
    ,tShip.start_coord_id
    ,tShip.start_date
    ,tStartPoint.point_name AS start_point_name
    ,tStartPoint.ice_class_id AS start_ice_class_id
FROM nsr.t_tasks_icebreakers AS tShip
INNER JOIN nsr.t_tasks AS tTask
    ON tTask.task_id = tShip.task_id
INNER JOIN nsr.v_ice_statgraph_points AS tStartPoint
    ON tStartPoint.ice_id = tTask.ice_id
    AND tStartPoint.coord_id = tShip.start_coord_id
LEFT JOIN nsr.t_dict_arc_class AS tArcClass
    ON tArcClass.arc_class_id = tShip.arc_class_id
;

DROP FUNCTION IF EXISTS nsr.fnc_task_prepare_data;
CREATE OR REPLACE FUNCTION nsr.fnc_task_prepare_data( p_task_id INT )
RETURNS BIT AS $$
BEGIN
    
    
        -------------------------------------------
        -- Заливаем расписание судов
        INSERT INTO nsr.t_tasks_ships
        (
             task_id
            ,ship_name
            ,arc_class_id
            ,arc_class_input
            ,speed_knot
            ,speed_kmph
            ,start_p_id
            ,start_coord_id
            ,end_p_id
            ,end_coord_id
            ,start_date
        )
        SELECT
             tData.task_id
            ,tData.ship_name
            ,tArc.arc_class_id
            ,tData.ship_arc_class AS arc_class_input
            ,tData.ship_speed AS speed_knot
            ,ROUND((tData.ship_speed * 1.852)::NUMERIC, 2) AS speed_kmph
            ,tStartPoint.p_id AS start_p_id
            ,tStartPoint.coord_id AS start_coord_id
            ,tEndPoint.p_id AS end_p_id
            ,tEndPoint.coord_id AS end_coord_id
            ,tData.start_date
        FROM nsr.v_tasks_transponse_schedule AS tData
        INNER JOIN nsr.t_tasks AS tTask
            ON tTask.task_id = tData.task_id
        LEFT JOIN nsr.v_ice_statgraph_points AS tStartPoint
            ON tStartPoint.point_id  = tData.start_point_id
            AND tStartPoint.ice_id = tTask.ice_id
        LEFT JOIN nsr.v_ice_statgraph_points AS tEndPoint
            ON tEndPoint.point_id  = tData.end_point_id    
            AND tEndPoint.ice_id = tTask.ice_id
        LEFT JOIN nsr.t_dict_arc_class AS tArc
            ON tData.ship_arc_class = tArc.arc_class_name
        WHERE 1 = 1
            AND tData.task_id = p_task_id
        ;    

        INSERT INTO nsr.t_tasks_icebreakers
        (
             task_id
            ,ship_name
            ,arc_class_id
            ,arc_class_input
            ,speed_knot
            ,speed_kmph
            ,start_p_id
            ,start_coord_id
            ,start_date
        )
        SELECT
             tData.task_id
            ,tData.ship_name
            ,tArc.arc_class_id
            ,tData.ship_arc_class AS arc_class_input
            ,tData.ship_speed AS speed_knot
            ,ROUND((tData.ship_speed * 1.852)::NUMERIC, 2) AS speed_kmph
            ,tStartPoint.p_id AS start_p_id
            ,tStartPoint.coord_id AS start_coord_id
            ,tData.start_date
        FROM nsr.v_tasks_transponse_icebreaker AS tData
        INNER JOIN nsr.t_tasks AS tTask
            ON tTask.task_id = tData.task_id
        LEFT JOIN nsr.v_ice_statgraph_points AS tStartPoint
            ON tStartPoint.point_id  = tData.start_point_id
            AND tStartPoint.ice_id = tTask.ice_id
        LEFT JOIN nsr.t_dict_arc_class AS tArc
            ON tData.ship_arc_class = tArc.arc_class_name
        WHERE 1 = 1
            AND tData.task_id = p_task_id
        ;    

        RETURN 1;
END;
$$ LANGUAGE plpgsql;

DROP FUNCTION IF EXISTS nsr.fnc_ice_prepare_data;
CREATE OR REPLACE FUNCTION nsr.fnc_ice_prepare_data( p_task_id INT, p_ice_id INT )
RETURNS BIT AS $$
BEGIN
        -------------------------------------------
        -- Заливаем координаты 
        INSERT INTO nsr.t_ice_coords(
            ice_id
            , x
            , y
            , lon
            , lat
        )
        SELECT p_ice_id, x, y, lon, lat
        FROM nsr.v_tasks_transponse_coordinates
        WHERE 1 = 1
            AND task_id = p_task_id
        ;   
        -------------------------------------------
        -- Заливаем даты льда
        INSERT INTO nsr.t_ice_dates(
            ice_id
            , dt
        )
        SELECT p_ice_id, dt
        FROM nsr.t_tasks_data_sheets
        WHERE 1 = 1
            AND task_id = p_task_id
            AND dt IS NOT NULL
        ORDER BY dt
        ;
        -- Обновляем первую дату льда
        UPDATE nsr.t_ice SET
        first_dt = (
            SELECT MIN(dt)
            FROM nsr.t_ice_dates
            WHERE ice_id = p_ice_id
        )
        WHERE 1 = 1
            AND ice_id = p_ice_id
        ;    
        -------------------------------------------
        -- Заливаем значения льда
        INSERT INTO nsr.t_ice_values(
            coord_id
            , dt
            , value
            , ice_type_id
            , ice_class_id
        )
        SELECT
             tCoord.coord_id
            ,tData.dt
            ,tData.value
            ,tData.ice_type_id
            ,tData.ice_class_id
        FROM nsr.v_tasks_transponse_icedata AS tData
        INNER JOIN nsr.t_ice_coords AS tCoord
            ON tCoord.ice_id = p_ice_id
            AND tCoord.x = tData.x
            AND tCoord.y = tData.y 
        WHERE 1 = 1
            AND tData.task_id = p_task_id
            AND tData.value >= 0
        ;

        ------------------------------------------------
        -- Обновляем координаты земли
        UPDATE nsr.t_ice_coords AS tCoord
        SET is_earth = B'1'
        WHERE (tCoord.ice_id, tCoord.x, tCoord.y) IN (
            SELECT tCoord.ice_id, tCoord.x, tCoord.y
            FROM nsr.t_ice_coords AS tCoord
            LEFT JOIN nsr.v_ice_values AS tVal
                ON tCoord.coord_id = tVal.coord_id 
            WHERE tCoord.ice_id = p_ice_id
              AND tVal.x IS NULL
            GROUP BY tCoord.ice_id, tCoord.x, tCoord.y  
        );

        -------------------------------------------
        -- Заливаем привязку льда к statgraph_points
        INSERT INTO nsr.t_ice_statgraph_points(
             coord_id
            ,point_id
        )
        SELECT 
             ic.coord_id
            ,sp.id
        FROM 
            nsr.t_statgraph_points AS sp
        JOIN LATERAL (
            SELECT 
                ic.coord_id,
                ic.lon,
                ic.lat
            FROM nsr.t_ice_coords AS ic
            WHERE 1 = 1
                AND ic.ice_id = p_ice_id
                AND ic.is_earth = B'0'
            ORDER BY 
                ABS(ic.lon - sp.longitude) + ABS(ic.lat - sp.latitude)
            LIMIT 1
        ) AS ic ON TRUE;

    
        RETURN 1;
END;
$$ LANGUAGE plpgsql;

----------------------------------------------------------
-- Граф льда
----------------------------------------------------------

DROP VIEW IF EXISTS nsr.v_ice_graph;
CREATE VIEW nsr.v_ice_graph AS
SELECT
    tGraph.ice_id
    ,tGraph.dt
    ,start_coord_id
    ,('x' || start_x || 'y' || start_y)::VARCHAR(32) AS start_p_id
    ,start_x
    ,start_y
    ,('x' || end_x || 'y' || end_y)::VARCHAR(32) AS end_p_id    
    ,end_x
    ,end_y
    ,start_value
    ,end_coord_id
    ,end_value
    ,avg_value
    --,GREATEST(start_ice_class_id, end_ice_class_id) AS ice_class_id
    ,end_ice_class_id AS ice_class_id
    ,distance
    ------------------------------------
    -- Определение веса рёбер
    ------------------------------------
    ,CASE
        WHEN tGraph.end_value = 0
        THEN 0         
        WHEN end_ice_class_id = 0
        THEN 0 
        ELSE ROUND((
            (1 - 0.9 * (tGraph.end_value - tExtr.value_min) / (tExtr.value_max - tExtr.value_min))
            * (0.1 + 0.9  * (tGraph.distance - tExtr.distance_min) / (tExtr.distance_max - tExtr.distance_min))
            * 100
            )::NUMERIC
            ,0) -- Округляем до трёх знаков
        END::INT AS weight
    --,(avg_value * distance)::INT AS weight
FROM nsr.t_ice_graph AS tGraph
INNER JOIN nsr.t_ice_graph_extremum AS tExtr
    ON tExtr.ice_id  = tGraph.ice_id
    AND tExtr.dt  = tGraph.dt
;

DROP FUNCTION IF EXISTS nsr.fnc_ice_prepare_graph;
CREATE OR REPLACE FUNCTION nsr.fnc_ice_prepare_graph( p_ice_id INT )
RETURNS BIT AS $$
BEGIN
    INSERT INTO nsr.t_ice_graph(
        ice_id,
        dt,
        start_coord_id,
        start_x,
        start_y,
        start_ice_class_id,
        end_x,
        end_y,
        start_value,
        --end_coord_id,
        --end_value,
        --avg_value,
        distance
    )
    SELECT
         tIce.ice_id 
        ,tIce.dt
        ,tIce.coord_id AS start_coord_id
        ,tIce.x AS start_x
        ,tIce.y AS start_y
        ,tIce.ice_class_id AS start_ice_class_id
        ,tIce.x + tDir.x_offset AS end_x
        ,tIce.y + tDir.y_offset AS end_y
        ,tIce.value AS start_value
        ,(CASE
            WHEN tDir.is_diagonal = 0 THEN 25
            ELSE ROUND( 25 * 1.4142) -- увеличиваем расстояние, потому что диагональ
         END)::INT AS distance
    FROM nsr.v_ice_values AS tIce
    CROSS JOIN nsr.t_dict_direction AS tDir
    WHERE 1 = 1
        AND tIce.ice_id = p_ice_id
    ;

    DELETE FROM nsr.t_ice_graph
    WHERE 1= 1
        AND ice_id = p_ice_id
        AND (
            start_x <= 0
            OR start_y <= 0
            OR end_x <= 0
            OR end_y <= 0
        );

    UPDATE nsr.t_ice_graph AS tGraph
    SET
        end_ice_class_id = tIce2.ice_class_id,
        end_coord_id = tIce2.coord_id,
        end_value = tIce2.value,
        avg_value = ROUND((tGraph.start_value + tIce2.value) / 2.0)::SMALLINT
    FROM nsr.v_ice_values AS tIce2
    WHERE 1 = 1
        AND tGraph.ice_id = p_ice_id
        AND tIce2.ice_id = tGraph.ice_id
        AND tIce2.dt = tGraph.dt
        AND tIce2.x = tGraph.end_x
        AND tIce2.y = tGraph.end_y
    ;
    
    -- TODO: Не понятно почему тут образуются пустые значения после апдейта выше
    -- Что-то он почему-то недоапдейчивает
    DELETE FROM nsr.t_ice_graph
    WHERE end_value IS NULL
    ;

    INSERT INTO nsr.t_ice_graph_extremum (
         ice_id
        , dt
        , value_max
        , value_min
        , distance_max
        , distance_min
    )
    SELECT 
         ice_id
        ,dt
        ,MAX(GREATEST(start_value, end_value)) AS value_max
        ,0.1 AS value_min --MIN(LEAST(start_value, end_value)) AS value_min
        ,MAX(distance) AS distance_max
        ,1 AS distance_min --MIN(distance) AS distance_min
    FROM nsr.t_ice_graph
    WHERE 1 = 1
        AND ice_id = p_ice_id
        AND start_value > 0
        AND end_value > 0
    GROUP BY
         ice_id
        ,dt
    ;

    RETURN 1;
END;
$$ LANGUAGE plpgsql;













--------------------------------------------
-- С помощью вот этих модулей можно считать расстояние между широтой и долготой
/*
    ----------------------- prompt
    в таблице находятся точки longitude, latitude
    SELECT id, longitude, latitude, point_name, rep_id
    FROM nsr.t_statgraph_points;
    
    напиши запрос на pgsql который найдёт для них максимально приближенную точку longitude, latitude из таблицы
    SELECT ice_id, x, y, lon AS longitude, lat AS latitude
    FROM nsr.t_ice_coords
    WHERE 1 = 1
        AND ice_id = 1;
    -----------------------
    
-- Это выводит все функции расширений
SELECT * --proname, proargtypes
FROM pg_proc
WHERE 1 = 1
    --proname = 'll_to_earth';
    -- AND proname LIKE '%distance%'
ORDER BY proname
------------------------
 
CREATE EXTENSION IF NOT EXISTS cube;
CREATE EXTENSION IF NOT EXISTS earthdistance;

SELECT 
    sp.id,
    sp.longitude AS statgraph_longitude,
    sp.latitude AS statgraph_latitude,
    sp.point_name,
    sp.rep_id,
    ic.ice_id,
    ic.x,
    ic.y,
    ic.lon AS ice_longitude,
    ic.lat AS ice_latitude,
    earth_distance(ll_to_earth(sp.latitude, sp.longitude), ll_to_earth(ic.lat, ic.lon)) AS distance
FROM 
    nsr.t_statgraph_points AS sp
CROSS JOIN LATERAL (
    SELECT 
        ic.ice_id,
        ic.x,
        ic.y,
        ic.lon,
        ic.lat
    FROM 
        nsr.t_ice_coords AS ic
    WHERE 
        ic.ice_id = 1
    ORDER BY 
        earth_distance(ll_to_earth(sp.latitude, sp.longitude), ll_to_earth(ic.lat, ic.lon))
    LIMIT 1
) AS ic;

---------------------------------------------------
Этот запрос делает следующее:

    CROSS JOIN LATERAL: Используется для того, чтобы выполнить подзапрос для каждой строки основной таблицы nsr.t_statgraph_points. Этот подзапрос возвращает одну строку — ближайшую точку из таблицы nsr.t_ice_coords.
    Подзапрос:
        Выбирает точки из nsr.t_ice_coords, где ice_id = 1.
        Упорядочивает результаты по расстоянию, вычисленному функцией earth_distance.
        Возвращает только одну строку (наиболее близкую точку) с помощью LIMIT 1.
    earth_distance: Вычисляет расстояние между двумя географическими точками, представленных в виде координат широты и долготы.
    Основной запрос выбирает все необходимые поля и добавляет вычисленное расстояние в результате.

Таким образом, для каждой точки из nsr.t_statgraph_points вы получаете самую близкую точку из nsr.t_ice_coords с ice_id = 1, а также расстояние между ними.
---------------------------------------------------
*/

