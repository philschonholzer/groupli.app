CREATE TABLE IF NOT EXISTS Persons (
  Id INTEGER PRIMARY KEY,
  Name TEXT,
  Color TEXT
);

INSERT INTO
  Persons (Id, Name, Color)
VALUES
  (1, 'Alfreds Futterkiste', '#33AA11'),
  (4, 'Around the Horn', '#338833'),
  (11, 'Jenny Garcia', '#FFC0CB'),
  (13, 'Sandra Pullman', '#008080');