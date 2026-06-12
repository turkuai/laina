-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 22, 2026 at 02:25 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `lainaaminen`
--

-- --------------------------------------------------------

--
-- Table structure for table `borrow_history`
--

CREATE TABLE `borrow_history` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `borrower_id` int(11) DEFAULT NULL,
  `borrower_name_snapshot` varchar(201) DEFAULT NULL,
  `lender_id` int(11) DEFAULT NULL,
  `borrow_date` datetime NOT NULL DEFAULT current_timestamp(),
  `estimated_return_date` date DEFAULT NULL,
  `actual_return_date` datetime DEFAULT NULL,
  `return_processed_by` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `borrow_history`
--

INSERT INTO `borrow_history` (`id`, `product_id`, `borrower_id`, `borrower_name_snapshot`, `lender_id`, `borrow_date`, `estimated_return_date`, `actual_return_date`, `return_processed_by`, `notes`, `created_at`, `updated_at`) VALUES
(1, 2, 4, 'Aurora Williams', 2, '2025-10-10 09:00:00', '2025-10-12', '2025-10-12 16:00:00', 2, NULL, '2025-10-22 09:44:02', '2025-10-22 09:44:02'),
(2, 2, 5, 'Kevin Brown', 2, '2025-09-25 14:00:00', '2025-09-28', '2025-09-28 17:00:00', 2, NULL, '2025-10-22 09:44:02', '2025-10-22 09:44:02'),
(3, 1, 4, 'Aurora Williams', 2, '2025-10-10 10:00:00', '2025-10-12', '2025-10-12 16:00:00', 2, NULL, '2025-10-22 09:44:02', '2025-10-22 09:44:02'),
(4, 1, 5, 'Kevin Brown', 2, '2025-09-25 15:00:00', '2025-09-28', NULL, NULL, NULL, '2025-10-22 09:44:02', '2025-10-22 09:44:02');

--
-- Triggers `borrow_history`
--
DELIMITER $$
CREATE TRIGGER `update_product_status_after_borrow` AFTER INSERT ON `borrow_history` FOR EACH ROW BEGIN
    IF NEW.actual_return_date IS NULL THEN
        UPDATE products SET status = 'borrowed' WHERE id = NEW.product_id;
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `update_product_status_after_return` AFTER UPDATE ON `borrow_history` FOR EACH ROW BEGIN
    IF OLD.actual_return_date IS NULL AND NEW.actual_return_date IS NOT NULL THEN
        -- Check if there are any other unreturned borrows for this product
        IF NOT EXISTS (
            SELECT 1 FROM borrow_history 
            WHERE product_id = NEW.product_id 
            AND actual_return_date IS NULL 
            AND id != NEW.id
        ) THEN
            UPDATE products SET status = 'available' WHERE id = NEW.product_id;
        END IF;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `device_types`
--

CREATE TABLE `device_types` (
  `id` int(11) NOT NULL,
  `type_name` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `device_types`
--

INSERT INTO `device_types` (`id`, `type_name`, `created_at`) VALUES
(1, 'Camera', '2025-10-22 09:44:02'),
(2, 'Drone', '2025-10-22 09:44:02'),
(3, 'Light', '2025-10-22 09:44:02'),
(4, 'Microphone', '2025-10-22 09:44:02'),
(5, 'Tripod', '2025-10-22 09:44:02'),
(6, 'Lens', '2025-10-22 09:44:02'),
(7, 'Audio Recorder', '2025-10-22 09:44:02'),
(8, 'Video Equipment', '2025-10-22 09:44:02');

-- --------------------------------------------------------

--
-- Table structure for table `locations`
--

CREATE TABLE `locations` (
  `id` int(11) NOT NULL,
  `location_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `locations`
--

INSERT INTO `locations` (`id`, `location_name`, `description`, `created_at`) VALUES
(1, 'Studio 1', 'Main studio on first floor', '2025-10-22 09:44:02'),
(2, 'Studio 2', 'Secondary studio on second floor', '2025-10-22 09:44:02'),
(3, 'Storage Room', 'Equipment storage room', '2025-10-22 09:44:02'),
(4, 'Office', 'Administrative office', '2025-10-22 09:44:02'),
(5, 'Editing Room', 'Video editing suite', '2025-10-22 09:44:02');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `device_type_id` int(11) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `purchase_date` year(4) NOT NULL,
  `location_id` int(11) DEFAULT NULL,
  `status` enum('available','borrowed') DEFAULT 'available',
  `details` text DEFAULT NULL,
  `qr_code` varchar(255) DEFAULT NULL,
  `is_retired` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `flag` varchar(20) NOT NULL DEFAULT 'visible'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `device_type_id`, `product_name`, `purchase_date`, `location_id`, `status`, `details`, `qr_code`, `is_retired`, `created_at`, `updated_at`, `flag`) VALUES
(1, 1, 'Canon EOS R5', '2021', 1, 'borrowed', 'Full-frame mirrorless camera with 45MP sensor', 'QR_CANON_R5_001', 0, '2025-10-22 09:44:02', '2025-10-23 06:25:32', 'visible'),
(2, 2, 'DJI Mavic Air 2', '2020', 3, 'available', '4K drone with 48MP camera', 'QR_DJI_MAVIC_001', 0, '2025-10-22 09:44:02', '2026-01-29 09:57:25', 'visible'),
(3, 3, 'Godox SL60W', '2019', 2, 'available', '60W LED video light', 'QR_GODOX_SL60_001', 0, '2025-10-22 09:44:02', '2026-01-29 10:00:27', 'visible');

-- --------------------------------------------------------

--
-- Stand-in structure for view `product_current_status`
-- (See below for the actual view)
--
CREATE TABLE `product_current_status` (
`id` int(11)
,`product_name` varchar(255)
,`type_name` varchar(100)
,`purchase_date` year(4)
,`location_name` varchar(100)
,`status` enum('available','borrowed')
,`details` text
,`qr_code` varchar(255)
,`current_borrower_id` int(11)
,`current_borrower_name` varchar(201)
,`current_borrow_date` datetime
,`estimated_return_date` date
);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `role` enum('admin','teacher','student') NOT NULL DEFAULT 'student',
  `flag` enum('visible','hidden') NOT NULL DEFAULT 'visible',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `email_verified` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `password`, `email`, `first_name`, `last_name`, `phone_number`, `role`, `flag`, `created_at`, `updated_at`, `email_verified`) VALUES
(1, '$2a$12$qNOa3ibmvzzvVHiP6SVhreboubzUve4OMtCncIwg3WNmJTiVsnzPO', 'mohammad@edu.turku.fi', 'Mohammad', 'Admin', NULL, 'admin', 'visible', '2025-10-22 09:44:02', '2026-01-29 09:50:22', 0),
(2, '$2y$10$YourHashedPasswordHere', 'teacher1@edu.turku.fi', 'John', 'Smith', NULL, 'teacher', 'visible', '2025-10-22 09:44:02', '2025-10-22 09:44:02', 0),
(3, '$2y$10$YourHashedPasswordHere', 'teacher2@edu.turku.fi', 'Sarah', 'Johnson', NULL, 'teacher', 'visible', '2025-10-22 09:44:02', '2025-10-22 09:44:02', 0),
(4, '$2y$10$YourHashedPasswordHere', 'aurora@student.turku.fi', 'Aurora', 'Williams', NULL, 'student', 'visible', '2025-10-22 09:44:02', '2025-10-22 09:44:02', 0),
(5, '$2y$10$YourHashedPasswordHere', 'kevin@student.turku.fi', 'Kevin', 'Brown', NULL, 'student', 'visible', '2025-10-22 09:44:02', '2025-10-22 09:44:02', 0),
(6, '$2a$12$OIZc.AdOJMQRNlBmH0On4ubHufot7Ha86ihAKVKVjrQ1vQ7zSKPR.', 'admin2@email.com', 'admin2', 'Burrows', NULL, 'admin', 'visible', '2026-04-22 07:08:38', '2026-04-22 11:06:08', 1);

-- --------------------------------------------------------

--
-- Structure for view `product_current_status`
--
DROP TABLE IF EXISTS `product_current_status`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `product_current_status`  AS SELECT `p`.`id` AS `id`, `p`.`product_name` AS `product_name`, `dt`.`type_name` AS `type_name`, `p`.`purchase_date` AS `purchase_date`, `l`.`location_name` AS `location_name`, `p`.`status` AS `status`, `p`.`details` AS `details`, `p`.`qr_code` AS `qr_code`, `bh`.`borrower_id` AS `current_borrower_id`, concat(`u`.`first_name`,' ',`u`.`last_name`) AS `current_borrower_name`, `bh`.`borrow_date` AS `current_borrow_date`, `bh`.`estimated_return_date` AS `estimated_return_date` FROM ((((`products` `p` left join `device_types` `dt` on(`p`.`device_type_id` = `dt`.`id`)) left join `locations` `l` on(`p`.`location_id` = `l`.`id`)) left join `borrow_history` `bh` on(`p`.`id` = `bh`.`product_id` and `bh`.`actual_return_date` is null)) left join `users` `u` on(`bh`.`borrower_id` = `u`.`id`)) WHERE `p`.`is_retired` = 0 ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `borrow_history`
--
ALTER TABLE `borrow_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `lender_id` (`lender_id`),
  ADD KEY `return_processed_by` (`return_processed_by`),
  ADD KEY `idx_product` (`product_id`),
  ADD KEY `idx_borrower` (`borrower_id`),
  ADD KEY `idx_borrow_date` (`borrow_date`),
  ADD KEY `idx_actual_return_date` (`actual_return_date`);

--
-- Indexes for table `device_types`
--
ALTER TABLE `device_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `type_name` (`type_name`);

--
-- Indexes for table `locations`
--
ALTER TABLE `locations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `location_name` (`location_name`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `qr_code` (`qr_code`),
  ADD KEY `location_id` (`location_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_device_type` (`device_type_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_role` (`role`),
  ADD KEY `idx_email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `borrow_history`
--
ALTER TABLE `borrow_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `device_types`
--
ALTER TABLE `device_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `locations`
--
ALTER TABLE `locations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `borrow_history`
--
ALTER TABLE `borrow_history`
  ADD CONSTRAINT `borrow_history_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `borrow_history_ibfk_2` FOREIGN KEY (`borrower_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `borrow_history_ibfk_3` FOREIGN KEY (`lender_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `borrow_history_ibfk_4` FOREIGN KEY (`return_processed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`device_type_id`) REFERENCES `device_types` (`id`),
  ADD CONSTRAINT `products_ibfk_2` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`);
-- Add late_return flag to borrow_history
--
ALTER TABLE `borrow_history` ADD COLUMN `late_return` TINYINT(1) NOT NULL DEFAULT 0;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;