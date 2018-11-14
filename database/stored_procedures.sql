--stored procedures to for admin approve, change location and cancel trip is given
--after each procedure example is mentioned how to execute it

--   inserting into stu_trip_data when admin approves 
-- call the function when admin approves

CREATE  OR REPLACE FUNCTION  adminApproves(_USN VARCHAR)
RETURNS void  AS  $$
BEGIN
UPDATE Stu_Per_Data SET Status = true WHERE USN = _USN;

INSERT INTO USN_UID (USN) VALUES (_USN);

INSERT INTO Stu_Trip_Data (UID , latitude, longitude)
SELECT USN_UID.UID  AS UID, Stu_Per_Data.latitude AS latitude, Stu_Per_Data.longitude AS longitude
FROM USN_UID 
INNER JOIN Stu_Per_Data ON USN_UID.USN = Stu_Per_Data.USN
WHERE USN_UID.USN = _USN;
END;
$$ LANGUAGE 'plpgsql';


--SELECT adminApproves('01FB15ECS084');


--to update Chan_loc table 
--automatically update it Chan_loc
--required input :- trip_id, USN , latitude, longitude

CREATE OR REPLACE FUNCTION locChanges(_USN VARCHAR , _trip_id INT ,_latitude real, _longitude real)
RETURNS void AS $$
BEGIN 
DELETE FROM Chan_loc USING USN_UID
WHERE USN_UID.UID = Chan_loc.UID AND  USN_UID.USN = _USN AND Chan_loc.trip_id = _trip_id;
INSERT INTO Chan_loc(UID, trip_id, latitude, longitude)
VALUES
((SELECT USN_UID.UID FROM USN_UID WHERE USN = _USN), _trip_id, _latitude,_longitude);
END;
$$ LANGUAGE 'plpgsql';

--SELECT locChanges('01FB15ECS083', 2 , 12.99999, 13.678552);



--change Time function
CREATE OR REPLACE FUNCTION changeTime(_USN VARCHAR, _trip_id INT, _timing TIME)
RETURNS void AS $$
BEGIN 
DELETE FROM Chan_time USING USN_UID
WHERE USN_UID.UID = Chan_time.UID AND USN_UID.USN = _USN AND Chan_time.trip_id = _trip_id;
INSERT INTO Chan_Time(UID, trip_id , timing)
VALUES
((SELECT USN_UID.UID FROM USN_UID WHERE USN = _USN), _trip_id, _timing);
END;
$$ LANGUAGE 'plpgsql' ;




--to update cancel trip;
--should give trip_id and USN as input
CREATE OR REPLACE FUNCTION studentCancels(_USN VARCHAR , _tripid INT )
RETURNS void AS $$
BEGIN
INSERT INTO Cancel_trip ( trip_id, UID)
VALUES (_tripid ,(SELECT USN_UID.UID FROM USN_UID WHERE USN = _USN));
END;
$$ LANGUAGE 'plpgsql';
--SELECT studentCancels('01FB15ECS083',2) ;

--SELECT getLocation('01FB15ECS084',1);
CREATE OR REPLACE FUNCTION studentFutureTrips(_USN VARCHAR)
RETURNS void AS $$
BEGIN
SELECT Fut_trip.trip_id , Fut_trip.drop_pick,Fut_trip.trip_date, Fut_trip.timing
FROM Fut_trip
WHERE Fut_trip.trip_id NOT IN (
SELECT Cancel_trip.trip_id FROM Cancel_trip
INNER JOIN USN_UID ON Cancel_trip.UID = USN_UID.UID
WHERE USN_UID.USN = _USN)
ORDER BY Fut_trip.trip_id
limit 14;
END;
$$ LANGUAGE 'plpgsql';

--SELECT studentFutureTrips('01FB15ECS001');

CREATE OR REPLACE FUNCTION getLocation(_USN VARCHAR, _tripid INT)
RETURNS RECORD  AS $$
DECLARE location RECORD;
BEGIN
IF (SELECT COUNT(Chan_loc.UID)
FROM Chan_loc  INNER JOIN USN_UID
ON USN_UID.UID = Chan_loc.UID
WHERE USN = _USN AND trip_id = _tripid)>0 THEN
     SELECT latitude AS latitude, longitude AS longitude 
     FROM Chan_loc
     INNER JOIN USN_UID ON USN_UID.UID = Chan_loc.UID
     AND USN_UID.USN =_USN AND trip_id = _tripid
     INTO location;
ELSE
   SELECT latitude AS latitude, longitude AS longitude
    FROM Stu_Trip_Data
    INNER JOIN  USN_UID ON USN_UID.UID = Stu_trip_Data.UID
    WHERE USN_UID.USN =_USN
    INTO location;
END IF ;
RETURN location;
END;
$$ LANGUAGE plpgsql;

--=====================================
-- to get latitude longitude of the current ongoing trip




CREATE OR REPLACE FUNCTION getCurentLocation(_USN VARCHAR)
RETURNS RECORD  AS $$
DECLARE location RECORD;
BEGIN
IF (SELECT COUNT(Chan_loc.UID)
FROM Chan_loc  INNER JOIN USN_UID
ON USN_UID.UID = Chan_loc.UID
WHERE USN = _USN AND trip_id  IN (SELECT DISTINCT trip_id FROM Trip))>0 THEN
     SELECT latitude AS latitude, longitude AS longitude 
     FROM Chan_loc
     INNER JOIN USN_UID ON USN_UID.UID = Chan_loc.UID
     AND USN_UID.USN =_USN AND trip_id IN (SELECT DISTINCT trip_id FROM Trip)
     INTO location;
ELSE
   SELECT latitude AS latitude, longitude AS longitude
    FROM Stu_Trip_Data
    INNER JOIN  USN_UID ON USN_UID.UID = Stu_trip_Data.UID
    WHERE USN_UID.USN =_USN
    INTO location;
END IF ;
RETURN location;
END;
$$ LANGUAGE plpgsql;

--SELECT getCurentData('01F1B5ECS084');


CREATE OR REPLACE FUNCTION getPickUpLocation(_USN VARCHAR)
RETURNS RECORD  AS $$
DECLARE location RECORD;
BEGIN 
IF(SELECT DISTINCT Fut_trip.drop_pick FROM Fut_trip 
INNER JOIN Trip ON Trip.trip_id = Fut_trip.trip_id)= false THEN 
    SELECT latitude as latitude , longitude AS longitude From College_Loc INTO location;
ELSEIF (SELECT COUNT(Chan_loc.UID)
    FROM Chan_loc  INNER JOIN USN_UID
    ON USN_UID.UID = Chan_loc.UID
    WHERE USN = _USN AND trip_id  IN (SELECT DISTINCT trip_id FROM Trip))>0 THEN
     SELECT latitude AS latitude, longitude AS longitude 
     FROM Chan_loc
     INNER JOIN USN_UID ON USN_UID.UID = Chan_loc.UID
     AND USN_UID.USN =_USN AND trip_id IN (SELECT DISTINCT trip_id FROM Trip)
     INTO location;
ELSE
    SELECT latitude AS latitude, longitude AS longitude
    FROM Stu_Trip_Data
    INNER JOIN  USN_UID ON USN_UID.UID = Stu_trip_Data.UID
    WHERE USN_UID.USN =_USN
    INTO location;    
END IF;
RETURN location;
END;
$$ LANGUAGE plpgsql;
    

--SELECT getPickUpLocation('01FB15ECS081'); 


CREATE OR REPLACE FUNCTION completedTrip(_Driver_id VARCHAR)
RETURNS VOID AS $$
BEGIN
UPDATE Trip SET status = TRUE WHERE Driver_id = _Driver_id;
IF(SELECT COUNT(Status) FROM Trip WHERE Status = false)=0 THEN
DELETE FROM Chan_time WHERE trip_id IN 
(SELECT DISTINCT trip_id  FROM trip);
DELETE FROM Chan_loc WHERE tripSELECT COUNT(Chan_loc.UID)
FROM Chan_loc  INNER JOIN USN_UID
ON USN_UID.UID = Chan_loc.UID
WHERE USN = _USN AND trip_id  IN (SELECT DISTINCT trip_id FROM Trip)_id IN 
(SELECT DISTINCT trip_id  FROM trip);
DELETE FROM Cancel_trip WHERE trip_id IN 
(SELECT DISTINCT trip_id  FROM trip);
DELETE FROM Trip ;
END IF;
END;
$$ LANGUAGE 'plpgsql';

-- SELECT completedTrip('PESDR1');




