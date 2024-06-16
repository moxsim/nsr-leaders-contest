

CREATE OR REPLACE FUNCTION public.try_parse_date(date_str TEXT, format_str TEXT)
RETURNS DATE AS $$
DECLARE
    result DATE;
BEGIN
    BEGIN
        result := TO_DATE(date_str, format_str);
    EXCEPTION
        WHEN others THEN
            result := NULL;
    END;
    RETURN result;
END;
$$ LANGUAGE plpgsql;