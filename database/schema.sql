-- MySQL dump style schema matching PDF specification
--
-- Database: taskdb
-- Run:  mysql -u root -p < database/schema.sql
-- ------------------------------------------------------

CREATE DATABASE IF NOT EXISTS `taskdb` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */;
USE `taskdb`;

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `tasks`;
DROP TABLE IF EXISTS `users`;
DROP VIEW IF EXISTS `task`;
DROP VIEW IF EXISTS `app_user`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('ADMIN','MANAGER','EMPLOYEE') NOT NULL,
  `manager_id` bigint DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_email` (`email`),
  KEY `idx_users_manager` (`manager_id`),
  CONSTRAINT `fk_users_manager` FOREIGN KEY (`manager_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
-- Logins: admin@demo.com / Admin@123, manager@demo.com / Manager@123, emp1@demo.com & emp2@demo.com / Emp@123
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` (`id`, `full_name`, `email`, `password`, `role`, `manager_id`, `created_at`, `active`) VALUES
(1,'System Admin','admin@demo.com','$2a$10$pmCHPyfLDiRGxEy8AFv4ke.J6mjVMntmUnNnlXybEmeiVTj2Jhvyy','ADMIN',NULL,'2026-11-01 09:00:00',1),
(2,'Mia Manager','manager@demo.com','$2a$10$judlcOpgtcatbg2D4srlfuF/FNFd/ikisqOy15mzEMMhEXBndCkG.','MANAGER',NULL,'2026-11-01 09:00:00',1),
(3,'Evan Employee','emp1@demo.com','$2a$10$n6t/IEXhK9dQ1MxEJ3Rxm.pJV2MuuoQWYzkR8QQPDeGRXVtTOEvaa','EMPLOYEE',2,'2026-11-01 09:00:00',1),
(4,'Emma Employee','emp2@demo.com','$2a$10$n6t/IEXhK9dQ1MxEJ3Rxm.pJV2MuuoQWYzkR8QQPDeGRXVtTOEvaa','EMPLOYEE',2,'2026-11-01 09:00:00',1);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tasks`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tasks` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `description` text,
  `status` enum('PENDING','IN_PROGRESS','DONE') NOT NULL DEFAULT 'PENDING',
  `priority` enum('LOW','MEDIUM','HIGH') NOT NULL DEFAULT 'MEDIUM',
  `deadline` date DEFAULT NULL,
  `assigned_to` bigint NOT NULL,
  `assigned_by` bigint NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tasks_assigned_to` (`assigned_to`),
  KEY `idx_tasks_assigned_by` (`assigned_by`),
  KEY `idx_tasks_status` (`status`),
  CONSTRAINT `fk_tasks_assigned_to` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_tasks_assigned_by` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tasks`
--

LOCK TABLES `tasks` WRITE;
/*!40000 ALTER TABLE `tasks` DISABLE KEYS */;
INSERT INTO `tasks` (`id`, `title`, `description`, `status`, `priority`, `deadline`, `assigned_to`, `assigned_by`, `created_at`, `updated_at`) VALUES
(1,'Prepare monthly sales report','Collect figures from all regions.','PENDING','HIGH','2026-11-10',3,2,'2026-11-01 09:30:00',NULL),
(2,'Update onboarding checklist','Add the new laptop-setup steps.','IN_PROGRESS','MEDIUM','2026-11-14',3,2,'2026-11-01 09:30:00','2026-11-01 11:00:00'),
(3,'Clean up customer database','Remove duplicate contact records.','DONE','LOW','2026-10-30',4,2,'2026-10-25 09:30:00','2026-10-29 16:00:00'),
(4,'Draft vendor contract summary','One-page summary for the finance team.','PENDING','MEDIUM','2026-11-20',4,2,'2026-11-01 09:30:00',NULL);
/*!40000 ALTER TABLE `tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Compatibility Views for app_user and task
--
CREATE OR REPLACE VIEW `app_user` AS 
  SELECT `id`, `email`, `full_name` AS `name`, `password`, `role`, IF(`active` = 1, 'ACTIVE', 'INACTIVE') AS `status`, `manager_id`, `created_at` 
  FROM `users`;

CREATE OR REPLACE VIEW `task` AS 
  SELECT `id`, `title`, `description`, `status`, `priority`, `deadline`, `assigned_to`, `assigned_by`, `created_at`, `updated_at` 
  FROM `tasks`;

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
