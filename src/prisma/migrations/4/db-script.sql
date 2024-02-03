-- phpMyAdmin SQL Dump
-- version 5.2.1deb1ubuntu1
-- https://www.phpmyadmin.net/
--

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `misfit_bot_ts`
--

-- --------------------------------------------------------

--
-- Table structure for table `Guild`
--

CREATE TABLE `Guild` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `primaryChannel` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `Guild`
--

INSERT INTO `Guild` (`id`, `name`, `primaryChannel`) VALUES
('1158047785170510005', 'ViolasOnFire\'s server', NULL),
('525132099326574603', 'Frikicueva', NULL),
('888985811805171743', 'VRC dudes', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `GuildModules`
--

CREATE TABLE `GuildModules` (
  `guildId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `moduleId` int NOT NULL,
  `enabled` tinyint NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- --------------------------------------------------------

--
-- Table structure for table `GuildSettings`
--

CREATE TABLE `GuildSettings` (
  `guildId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `settingId` int NOT NULL,
  `value` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- --------------------------------------------------------

--
-- Table structure for table `GuildUser`
--

CREATE TABLE `GuildUser` (
  `guildId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- --------------------------------------------------------

--
-- Table structure for table `Module`
--

CREATE TABLE `Module` (
  `id` int NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `Module`
--

INSERT INTO `Module` (`id`, `name`, `description`) VALUES
(1, 'Information', 'This menu lets server administrators enable or disable certain functions that the bot provides (modules).\r\n'),
(2, 'Birthdays', 'This module notifies server members of birthdays of server members that have this module enabled as well. The notifications are sent to the main channel. **/setting mainchannel**'),
(3, 'Tags', 'This module allows users to save content (text, URLs, images) in a tag using the /tag command and then retrieve the tag\\\'s contents by using the same command. Due to the user-generated nature of this command it might be better to disable it to prevent NSFW or inappropiate content.');

-- --------------------------------------------------------

--
-- Table structure for table `Preference`
--

CREATE TABLE `Preference` (
  `id` int NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `Preference`
--

INSERT INTO `Preference` (`id`, `name`, `description`) VALUES
(1, 'Announce birthday', 'If this setting is enabled, your birthday will be notified to people in this server if server admins have enabled birthday notifications. You must save your birthday using the **/birthday** command as well for this to work.');

-- --------------------------------------------------------

--
-- Table structure for table `Setting`
--

CREATE TABLE `Setting` (
  `id` int NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('string','choices','boolean','integer','number','channel','user') COLLATE utf8mb4_unicode_ci NOT NULL,
  `typeSettings` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `commandName` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `commandDescription` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `commandPlaceholder` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `optionName` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `optionDescription` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `Setting`
--

INSERT INTO `Setting` (`id`, `name`, `description`, `type`, `typeSettings`, `commandName`, `commandDescription`, `commandPlaceholder`, `optionName`, `optionDescription`) VALUES
(1, 'Main Channel', 'This setting defines the main server channel. All bot messages will be sent to this channel, unless the interaction is made in another channel, in that case the bot will reply in the channel the interaction was sent. Some modules require this to be set for them to work.', 'channel', '', 'mainchannel', 'Define the main server channel.', '<Channel>', 'channel', 'The channel to set as main.');

-- --------------------------------------------------------

--
-- Table structure for table `Tag`
--

CREATE TABLE `Tag` (
  `id` int NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `usageCount` int NOT NULL DEFAULT '0',
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `User`
--

CREATE TABLE `User` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `birthday` date DEFAULT NULL,
  `lastBirthdayChange` datetime(3) DEFAULT NULL,
  `username` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `UserPreferences`
--

CREATE TABLE `UserPreferences` (
  `preferenceId` int NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `guildId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `enabled` tinyint NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- --------------------------------------------------------

--
-- Table structure for table `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int UNSIGNED NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('0ad858d7-a04a-44a6-b347-3ecf62488b56', '573633a4eef259c07a2389f7cef4a5ced91cfba589b9b8b7f3f84d30120a1317', '2024-01-27 21:01:58.342', '0_init', '', NULL, '2024-01-27 21:01:58.342', 0),
('6643c3be-f570-4523-810c-7af992271978', '45ff1af10059619d2db2b7b9c171bf43e6b37ca285f98b17b24016ac9fe0c04f', '2024-01-27 23:55:33.126', '1', '', NULL, '2024-01-27 23:55:33.126', 0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `Guild`
--
ALTER TABLE `Guild`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `GuildModules`
--
ALTER TABLE `GuildModules`
  ADD PRIMARY KEY (`guildId`,`moduleId`),
  ADD KEY `GuildModules_moduleId_fkey` (`moduleId`);

--
-- Indexes for table `GuildSettings`
--
ALTER TABLE `GuildSettings`
  ADD PRIMARY KEY (`guildId`,`settingId`),
  ADD KEY `GuildSettings_settingId_fkey` (`settingId`);

--
-- Indexes for table `GuildUser`
--
ALTER TABLE `GuildUser`
  ADD PRIMARY KEY (`userId`,`guildId`),
  ADD KEY `GuildUser_guildId_fkey` (`guildId`);

--
-- Indexes for table `Module`
--
ALTER TABLE `Module`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `Preference`
--
ALTER TABLE `Preference`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `Setting`
--
ALTER TABLE `Setting`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `Tag`
--
ALTER TABLE `Tag`
  ADD PRIMARY KEY (`id`),
  ADD KEY `User_fk_1` (`userId`);

--
-- Indexes for table `User`
--
ALTER TABLE `User`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `UserPreferences`
--
ALTER TABLE `UserPreferences`
  ADD PRIMARY KEY (`guildId`,`preferenceId`,`userId`),
  ADD KEY `UserPreferences_preferenceId_fkey` (`preferenceId`),
  ADD KEY `UserPreferences_userId_fkey` (`userId`);

--
-- Indexes for table `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `Module`
--
ALTER TABLE `Module`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `Preference`
--
ALTER TABLE `Preference`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `Setting`
--
ALTER TABLE `Setting`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `Tag`
--
ALTER TABLE `Tag`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `GuildModules`
--
ALTER TABLE `GuildModules`
  ADD CONSTRAINT `GuildModules_guildId_fkey` FOREIGN KEY (`guildId`) REFERENCES `Guild` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `GuildModules_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `Module` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `GuildSettings`
--
ALTER TABLE `GuildSettings`
  ADD CONSTRAINT `GuildSettings_guildId_fkey` FOREIGN KEY (`guildId`) REFERENCES `Guild` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `GuildSettings_settingId_fkey` FOREIGN KEY (`settingId`) REFERENCES `Setting` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `GuildUser`
--
ALTER TABLE `GuildUser`
  ADD CONSTRAINT `GuildUser_guildId_fkey` FOREIGN KEY (`guildId`) REFERENCES `Guild` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `GuildUser_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `Tag`
--
ALTER TABLE `Tag`
  ADD CONSTRAINT `User_fk_1` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `UserPreferences`
--
ALTER TABLE `UserPreferences`
  ADD CONSTRAINT `UserPreferences_guildId_fkey` FOREIGN KEY (`guildId`) REFERENCES `Guild` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `UserPreferences_preferenceId_fkey` FOREIGN KEY (`preferenceId`) REFERENCES `Preference` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `UserPreferences_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
