-- Games Database
-- This runs automatically when PostgreSQL container starts

CREATE TABLE IF NOT EXISTS games (
    game_id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    genre VARCHAR(50) NOT NULL,
    developer VARCHAR(100),
    publisher VARCHAR(100),
    release_year INTEGER,
    platform VARCHAR(50),
    rating DECIMAL(3,1),
    price DECIMAL(6,2),
    description TEXT
);

-- Insert sample game data
INSERT INTO games (title, genre, developer, publisher, release_year, platform, rating, price, description) VALUES
-- Action Games
('Elden Ring', 'Action', 'FromSoftware', 'Bandai Namco', 2022, 'PC', 9.5, 59.99, 'An epic action RPG set in a dark fantasy world'),
('God of War Ragnarök', 'Action', 'Santa Monica Studio', 'Sony Interactive', 2022, 'PlayStation', 9.4, 69.99, 'Norse mythology adventure with Kratos and Atreus'),
('Devil May Cry 5', 'Action', 'Capcom', 'Capcom', 2019, 'PC', 8.8, 39.99, 'Stylish demon-hunting action game'),
('Sekiro: Shadows Die Twice', 'Action', 'FromSoftware', 'Activision', 2019, 'PC', 9.0, 59.99, 'Challenging ninja action in feudal Japan'),

-- RPG Games
('The Witcher 3', 'RPG', 'CD Projekt Red', 'CD Projekt', 2015, 'PC', 9.3, 39.99, 'Epic fantasy RPG following Geralt of Rivia'),
('Baldurs Gate 3', 'RPG', 'Larian Studios', 'Larian Studios', 2023, 'PC', 9.6, 59.99, 'D&D-based tactical RPG with deep storytelling'),
('Cyberpunk 2077', 'RPG', 'CD Projekt Red', 'CD Projekt', 2020, 'PC', 8.5, 49.99, 'Open-world RPG set in a dystopian future'),
('Final Fantasy XVI', 'RPG', 'Square Enix', 'Square Enix', 2023, 'PlayStation', 8.7, 69.99, 'Action-focused Final Fantasy adventure'),
('Persona 5 Royal', 'RPG', 'Atlus', 'Atlus', 2020, 'PlayStation', 9.4, 59.99, 'Stylish JRPG about high school phantom thieves'),

-- Shooter Games
('Call of Duty: Modern Warfare II', 'Shooter', 'Infinity Ward', 'Activision', 2022, 'PC', 8.2, 69.99, 'Modern military first-person shooter'),
('Valorant', 'Shooter', 'Riot Games', 'Riot Games', 2020, 'PC', 8.5, 0.00, 'Free-to-play tactical team shooter'),
('Apex Legends', 'Shooter', 'Respawn Entertainment', 'EA', 2019, 'PC', 8.7, 0.00, 'Battle royale with unique hero abilities'),
('Halo Infinite', 'Shooter', '343 Industries', 'Xbox Game Studios', 2021, 'Xbox', 8.3, 59.99, 'Sci-fi FPS with Master Chief'),

-- Strategy Games
('Civilization VI', 'Strategy', 'Firaxis Games', '2K Games', 2016, 'PC', 8.9, 59.99, 'Turn-based strategy building an empire'),
('StarCraft II', 'Strategy', 'Blizzard Entertainment', 'Blizzard', 2010, 'PC', 9.0, 0.00, 'Real-time strategy in space'),
('XCOM 2', 'Strategy', 'Firaxis Games', '2K Games', 2016, 'PC', 8.8, 39.99, 'Tactical strategy defending Earth from aliens'),
('Age of Empires IV', 'Strategy', 'Relic Entertainment', 'Xbox Game Studios', 2021, 'PC', 8.3, 59.99, 'Historical real-time strategy'),

-- Puzzle Games
('Portal 2', 'Puzzle', 'Valve', 'Valve', 2011, 'PC', 9.5, 9.99, 'Mind-bending first-person puzzle game'),
('Tetris Effect', 'Puzzle', 'Monstars', 'Enhance', 2018, 'PC', 8.9, 29.99, 'Musical and visual Tetris experience'),
('The Witness', 'Puzzle', 'Thekla Inc', 'Thekla Inc', 2016, 'PC', 8.4, 39.99, 'First-person puzzle exploration game'),

-- Sports Games
('FIFA 23', 'Sports', 'EA Sports', 'EA', 2022, 'PC', 7.8, 69.99, 'Premier soccer simulation'),
('NBA 2K23', 'Sports', 'Visual Concepts', '2K Sports', 2022, 'PC', 7.6, 59.99, 'Basketball simulation game'),
('Gran Turismo 7', 'Sports', 'Polyphony Digital', 'Sony Interactive', 2022, 'PlayStation', 8.4, 69.99, 'Realistic racing simulator'),

-- Horror Games
('Resident Evil Village', 'Horror', 'Capcom', 'Capcom', 2021, 'PC', 8.8, 39.99, 'Survival horror in a mysterious village'),
('Dead Space Remake', 'Horror', 'Motive Studio', 'EA', 2023, 'PC', 8.9, 59.99, 'Sci-fi survival horror remake'),
('The Last of Us Part I', 'Horror', 'Naughty Dog', 'Sony Interactive', 2022, 'PlayStation', 8.9, 69.99, 'Post-apocalyptic survival adventure'),

-- Adventure Games
('The Legend of Zelda: Tears of the Kingdom', 'Adventure', 'Nintendo', 'Nintendo', 2023, 'Switch', 9.7, 69.99, 'Open-world adventure in Hyrule'),
('Red Dead Redemption 2', 'Adventure', 'Rockstar Games', 'Rockstar Games', 2018, 'PC', 9.7, 59.99, 'Western adventure in 1899 America'),
('Horizon Forbidden West', 'Adventure', 'Guerrilla Games', 'Sony Interactive', 2022, 'PlayStation', 8.8, 69.99, 'Post-apocalyptic robot hunting adventure');

-- Create index for faster genre queries
CREATE INDEX idx_genre ON games(genre);

-- Create index for platform queries
CREATE INDEX idx_platform ON games(platform);