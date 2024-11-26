-- Drop the existing database
DROP DATABASE IF EXISTS ratings_dev_db;

-- Create the database
CREATE DATABASE IF NOT EXISTS ratings_dev_db;

-- Use the database
USE ratings_dev_db;

-- Create `user_data` table
CREATE TABLE IF NOT EXISTS user_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    search_history JSON,
    interests JSON,
    view_history JSON,
    review_history JSON,
    genres JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create `users` table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    profile_pic VARCHAR(255) DEFAULT 'application/web/public/Default-Profile-Picture.jpg',
    theme_preference ENUM('light', 'dark') DEFAULT 'light',
    user_data_id INT,  -- Foreign key linking to user_data table
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_data_id) REFERENCES user_data(id) ON DELETE SET NULL
);

-- Create `games` table
CREATE TABLE IF NOT EXISTS games (
    game_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    genre VARCHAR(100),
    tags JSON,
    platforms JSON,
    playtime_estimate INT,
    developer VARCHAR(255),
    publisher VARCHAR(255),
    game_mode ENUM('single-player', 'multiplayer', 'both') DEFAULT 'single-player',
    release_date DATE,
    review_rating INT CHECK (review_rating BETWEEN 1 AND 10),
    cover_image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create `reviews` table
CREATE TABLE IF NOT EXISTS reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,  -- Foreign key to users table
    game_id INT NOT NULL,  -- Foreign key to games table
    rating INT CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE
);

-- Insert sample data into `user_data` table
INSERT INTO user_data (search_history, interests, view_history, review_history, genres) VALUES
    ('["The Witcher 3", "Cyberpunk 2077", "Hades"]', '["sports", "action"]', '["The Witcher 3"]', '["1"]', '["RPG", "Adventure"]'),
    ('["Minecraft", "League of Legends", "Dark Souls III"]', '["adventure", "strategy"]', '["Minecraft"]', '["2"]', '["Strategy", "Puzzle"]'),
    ('["Animal Crossing", "Stardew Valley"]', '["puzzle", "arcade"]', '["Animal Crossing"]', '["3"]', '["Simulation"]'),
    ('["Battlefield V", "Call of Duty: Warzone"]', '["action", "sports"]', '["Battlefield V"]', '["4"]', '["Shooter"]'),
    ('["Among Us", "Phasmophobia"]', '["arcade", "mystery"]', '["Among Us"]', '["5"]', '["Horror"]'),
    ('["Assassins Creed Odyssey", "God of War"]', '["RPG", "adventure"]', '["God of War"]', '["6"]', '["Adventure"]'),
    ('["Gran Turismo Sport", "Forza Horizon 4"]', '["racing", "arcade"]', '["Gran Turismo Sport"]', '["7"]', '["Racing"]'),
    ('["Super Mario Odyssey", "Zelda: Breath of the Wild"]', '["strategy", "sports"]', '["Super Mario Odyssey"]', '["8"]', '["Platformer"]'),
    ('["Starcraft II", "Command & Conquer"]', '["strategy", "simulation"]', '["Starcraft II"]', '["9"]', '["RTS"]'),
    ('["Doom Eternal", "Half-Life 2"]', '["action", "horror"]', '["Doom Eternal"]', '["10"]', '["Shooter"]');

-- Insert sample data into `users` table
INSERT INTO users (name, email, password, profile_pic, theme_preference, user_data_id) VALUES
    ('Alice Smith', 'alice.smith@example.com', 'password1', '/uploads/profiles/alice.jpg', 'light', 1),
    ('Bob Johnson', 'bob.johnson@example.com', 'password2', '/uploads/profiles/bob.jpg', 'dark', 2),
    ('Charlie Brown', 'charlie.brown@example.com', 'password3', '/uploads/profiles/charlie.jpg', 'light', 3),
    ('David Wilson', 'david.wilson@example.com', 'password4', '/uploads/profiles/david.jpg', 'dark', 4),
    ('Eve Davis', 'eve.davis@example.com', 'password5', '/uploads/profiles/eve.jpg', 'light', 5),
    ('Frank Miller', 'frank.miller@example.com', 'password6', '/uploads/profiles/frank.jpg', 'dark', 6),
    ('Grace Lee', 'grace.lee@example.com', 'password7', '/uploads/profiles/grace.jpg', 'light', 7),
    ('Henry Adams', 'henry.adams@example.com', 'password8', '/uploads/profiles/henry.jpg', 'dark', 8),
    ('Ivy Green', 'ivy.green@example.com', 'password9', '/uploads/profiles/ivy.jpg', 'light', 9),
    ('Jack White', 'jack.white@example.com', 'password10', '/uploads/profiles/jack.jpg', 'dark', 10);

-- Insert sample data into `games` table
INSERT INTO games (title, description, genre, tags, platforms, playtime_estimate, developer, publisher, game_mode, release_date, review_rating, cover_image) VALUES
    ('Fortnite', 'Battle royale shooter', 'Shooter', '["battle-royale"]', '["PC", "PlayStation", "Xbox"]', 50, 'Epic Games', 'Epic Games', 'multiplayer', '2018-03-12', 8, '/assets/images/fortnite.jpg'),
    ('FIFA 21', 'Soccer simulation game', 'Sports', '["sports", "simulation"]', '["PC", "PlayStation", "Xbox"]', 40, 'EA Sports', 'Electronic Arts', 'multiplayer', '2020-10-06', 7, '/assets/images/fifa21.jpg'),
    ('Minecraft', 'Open-world sandbox', 'Sandbox', '["sandbox", "creative"]', '["PC", "PlayStation", "Xbox", "Mobile"]', 1000, 'Mojang Studios', 'Mojang Studios', 'both', '2011-11-18', 9, '/assets/images/minecraft.jpg'),
    ('The Witcher 3', 'Fantasy RPG', 'RPG', '["fantasy", "open-world"]', '["PC", "PlayStation", "Xbox"]', 150, 'CD Projekt Red', 'CD Projekt', 'single-player', '2015-05-18', 10, '/assets/images/witcher3.jpg'),
    ('Valorant', 'Tactical shooter', 'Shooter', '["tactical", "competitive"]', '["PC"]', 50, 'Riot Games', 'Riot Games', 'multiplayer', '2020-06-02', 9, '/assets/images/valorant.jpg'),
    ('Apex Legends', 'Battle royale with characters', 'Shooter', '["battle-royale", "character-based"]', '["PC", "PlayStation", "Xbox"]', 30, 'Respawn Entertainment', 'Electronic Arts', 'multiplayer', '2019-02-04', 9, '/assets/images/apex_legends.jpg'),
    ('League of Legends', 'Popular MOBA', 'Strategy', '["MOBA", "competitive"]', '["PC"]', 200, 'Riot Games', 'Riot Games', 'multiplayer', '2009-10-27', 8, '/assets/images/lol.jpg'),
    ('Overwatch', 'Team-based shooter', 'Shooter', '["team-based", "competitive"]', '["PC", "PlayStation", "Xbox"]', 40, 'Blizzard', 'Blizzard', 'multiplayer', '2016-05-24', 9, '/assets/images/overwatch.jpg'),
    ('Cyberpunk 2077', 'Futuristic RPG', 'RPG', '["open-world", "sci-fi"]', '["PC", "PlayStation", "Xbox"]', 100, 'CD Projekt Red', 'CD Projekt', 'single-player', '2020-12-10', 7, '/assets/images/cyberpunk.jpg'),
    ('Stardew Valley', 'Farming simulation', 'Simulation', '["farming", "life-simulation"]', '["PC", "PlayStation", "Xbox", "Mobile"]', 60, 'ConcernedApe', 'ConcernedApe', 'single-player', '2016-02-26', 9, '/assets/images/stardew.jpg');

-- Insert sample data into `reviews` table
INSERT INTO reviews (user_id, game_id, rating, review_text) VALUES
    (1, 1, 5, 'Amazing battle royale game!'),
    (2, 2, 4, 'Good simulation game, love it!'),
    (3, 3, 5, 'Best sandbox game ever!'),
    (4, 4, 4, 'Great RPG with engaging story.'),
    (5, 5, 3, 'Too tactical, but enjoyable.'),
    (6, 6, 5, 'One of the best battle royales.'),
    (7, 7, 4, 'Addictive gameplay in MOBA.'),
    (8, 8, 4, 'Fun shooter with unique heroes.'),
    (9, 9, 2, 'Expected more, some bugs.'),
    (10, 10, 5, 'Relaxing and fun farming game.');
