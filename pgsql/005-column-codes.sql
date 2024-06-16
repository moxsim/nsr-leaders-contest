SET search_path TO srv213918_pgsql;

-- Создаем таблицу с двумя полями
DROP TABLE IF EXISTS nsr.t_dict_column_codes;

CREATE TABLE nsr.t_dict_column_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(3) NOT NULL
);

-- Функция для генерации кода в указанной последовательности
CREATE OR REPLACE FUNCTION nsr.fnc_dict_column_codes()
RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
    j INTEGER;
    k INTEGER;
    l INTEGER;
    m INTEGER;
    first_char CHAR;
    second_char CHAR;
    third_char CHAR;
BEGIN
    -- Цикл по однобуквенным кодам
    FOR j IN 65..90 LOOP
        first_char := CHR(j);
        INSERT INTO nsr.t_dict_column_codes (code) VALUES (first_char);
    END LOOP;

    -- Цикл по двухбуквенным кодам
    FOR k IN 65..90 LOOP
        FOR l IN 65..90 LOOP
            first_char := CHR(k);
            second_char := CHR(l);
            INSERT INTO nsr.t_dict_column_codes (code) VALUES (first_char || second_char);
        END LOOP;
    END LOOP;

    -- Цикл по трёхбуквенным кодам
    FOR k IN 65..90 LOOP
        FOR l IN 65..90 LOOP
            FOR m IN 65..90 LOOP
                first_char := CHR(k);
                second_char := CHR(l);
                third_char := CHR(m);
                INSERT INTO nsr.t_dict_column_codes (code) VALUES (first_char || second_char || third_char);
            END LOOP;
        END LOOP;
    END LOOP;
END;
$$;

-- Вызываем функцию для генерации кодов
SELECT nsr.fnc_dict_column_codes();

SELECT COUNT(1) FROM nsr.t_dict_column_codes;

SELECT * FROM nsr.t_dict_column_codes;
