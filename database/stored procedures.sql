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


SELECT adminApproves('01FB15ECS001');


--to update Chan_loc table 
--automatically update it Chan_loc
--required input :- trip_id, USN , latitude, longitude

CREATE OR REPLACE FUNCTION locChanges(_USN VARCHAR , _trip_id INT ,_latitude real, _longitude real)
RETURNS void AS $$
BEGIN 
INSERT INTO Chan_loc(UID, trip_id, latitude, longitude)
VALUES
((SELECT USN_UID.UID FROM USN_UID WHERE USN = _USN), _trip_id, _latitude,_longitude);
END;
$$ LANGUAGE 'plpgsql';


SELECT locChanges('01FB15ECS083', 2 , 12.99999, 13.678552);






--to update cancel trip;
--should give trip_id and USN as input
CREATE OR REPLACE FUNCTION studentCancels(_USN VARCHAR , _tripid INT )
RETURNS void AS $$
BEGIN
INSERT INTO Cancel_trip ( trip_id, UID)
VALUES (_tripid ,(SELECT USN_UID.UID FROM USN_UID WHERE USN = _USN));
END;
$$ LANGUAGE 'plpgsql';


SELECT studentCancels('01FB15ECS083',2) ;

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
limit 14
END;
$$ LANGUAGE 'plpgsql';

SELECT studentFutureTrips('01FB15ECS001');