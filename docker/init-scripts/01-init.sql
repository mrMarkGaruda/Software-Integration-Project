-- Create extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    email VARCHAR(100) PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(100) NOT NULL,
    creation_date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Create addresses table
CREATE TABLE IF NOT EXISTS addresses (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) REFERENCES users(email) ON DELETE CASCADE,
    country VARCHAR(50) NOT NULL,
    city VARCHAR(50),
    street VARCHAR(100)
);

-- Create movies table
CREATE TABLE IF NOT EXISTS movies (
    movie_id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    release_date DATE NOT NULL,
    rating DECIMAL(2,1) DEFAULT 0.0
);

-- Create seen_movies table to track which users have seen which movies
CREATE TABLE IF NOT EXISTS seen_movies (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) REFERENCES users(email) ON DELETE CASCADE,
    movie_id INTEGER REFERENCES movies(movie_id) ON DELETE CASCADE,
    date_seen DATE NOT NULL DEFAULT CURRENT_DATE,
    UNIQUE(email, movie_id)
);

-- Insert sample movie data
INSERT INTO movies (title, type, release_date, rating) VALUES
('The Shawshank Redemption', 'Drama', '1994-10-14', 4.5),
('The Godfather', 'Crime', '1972-03-24', 4.8),
('The Dark Knight', 'Action', '2008-07-18', 4.7),
('Pulp Fiction', 'Crime', '1994-10-14', 4.6),
('Schindler''s List', 'Drama', '1993-12-15', 4.9),
('Inception', 'Sci-Fi', '2010-07-16', 4.5),
('The Matrix', 'Sci-Fi', '1999-03-31', 4.4),
('Goodfellas', 'Crime', '1990-09-21', 4.6),
('The Silence of the Lambs', 'Thriller', '1991-02-14', 4.5),
('Star Wars: Episode IV', 'Sci-Fi', '1977-05-25', 4.7),
('The Lord of the Rings: The Fellowship of the Ring', 'Fantasy', '2001-12-19', 4.8),
('Forrest Gump', 'Drama', '1994-07-06', 4.7),
('The Avengers', 'Action', '2012-05-04', 4.3),
('Titanic', 'Romance', '1997-12-19', 4.2),
('Jurassic Park', 'Adventure', '1993-06-11', 4.1)
ON CONFLICT DO NOTHING;

-- Create admin user with hashed password (password is 'admin')
INSERT INTO users (email, username, password, creation_date) VALUES
('admin@example.com', 'admin', crypt('admin', gen_salt('bf')), CURRENT_DATE),
('user@example.com', 'user', crypt('password', gen_salt('bf')), CURRENT_DATE)
ON CONFLICT DO NOTHING;

-- Insert sample addresses
INSERT INTO addresses (email, country, city, street) VALUES
('admin@example.com', 'France', 'Paris', '123 Admin St'),
('user@example.com', 'USA', 'New York', '456 User Ave')
ON CONFLICT DO NOTHING;

-- Create sample seen movies
INSERT INTO seen_movies (email, movie_id, date_seen) VALUES
('admin@example.com', 1, CURRENT_DATE - INTERVAL '10 days'),
('admin@example.com', 3, CURRENT_DATE - INTERVAL '5 days'),
('user@example.com', 2, CURRENT_DATE - INTERVAL '15 days'),
('user@example.com', 4, CURRENT_DATE - INTERVAL '2 days')
ON CONFLICT DO NOTHING;

-- Create needed indexes
CREATE INDEX IF NOT EXISTS idx_movies_type ON movies(type);
CREATE INDEX IF NOT EXISTS idx_movies_rating ON movies(rating);
CREATE INDEX IF NOT EXISTS idx_seen_movies_email ON seen_movies(email);