-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 22, 2025 at 11:44 AM
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
-- Database: `fleet_management`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `borrow_product` (IN `p_product_id` INT, IN `p_borrower_id` INT, IN `p_teacher_id` INT, IN `p_estimated_return_date` DATE, IN `p_notes` TEXT)   BEGIN
    DECLARE v_product_status VARCHAR(20);
    
    -- Check if product exists and is available
    SELECT status INTO v_product_status
    FROM products
    WHERE id = p_product_id AND is_retired = FALSE;
    
    IF v_product_status = 'available' THEN
        -- Insert borrow record
        INSERT INTO borrow_history (product_id, borrower_id, teacher_id, estimated_return_date, notes)
        VALUES (p_product_id, p_borrower_id, p_teacher_id, p_estimated_return_date, p_notes);
        
        -- Update product status
        UPDATE products SET status = 'borrowed' WHERE id = p_product_id;
        
        SELECT 'SUCCESS' as result, 'Product borrowed successfully' as message;
    ELSE
        SELECT 'ERROR' as result, 'Product is not available for borrowing' as message;
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `return_product` (IN `p_product_id` INT, IN `p_teacher_id` INT, IN `p_notes` TEXT)   BEGIN
    DECLARE v_borrow_id INT;
    
    -- Find active borrow record
    SELECT id INTO v_borrow_id
    FROM borrow_history
    WHERE product_id = p_product_id AND status = 'borrowed'
    ORDER BY borrow_date DESC
    LIMIT 1;
    
    IF v_borrow_id IS NOT NULL THEN
        -- Update borrow record
        UPDATE borrow_history 
        SET status = 'returned', 
            actual_return_date = NOW(), 
            return_processed_by = p_teacher_id,
            notes = CONCAT(IFNULL(notes, ''), ' Return notes: ', p_notes)
        WHERE id = v_borrow_id;
        
        -- Update product status
        UPDATE products SET status = 'available' WHERE id = p_product_id;
        
        SELECT 'SUCCESS' as result, 'Product returned successfully' as message;
    ELSE
        SELECT 'ERROR' as result, 'No active borrow record found for this product' as message;
    END IF;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `borrow_history`
--

CREATE TABLE `borrow_history` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `borrower_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `borrow_date` datetime NOT NULL DEFAULT current_timestamp(),
  `estimated_return_date` date DEFAULT NULL,
  `actual_return_date` datetime DEFAULT NULL,
  `return_processed_by` int(11) DEFAULT NULL,
  `status` enum('borrowed','returned') DEFAULT 'borrowed',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `borrow_history`
--

INSERT INTO `borrow_history` (`id`, `product_id`, `borrower_id`, `teacher_id`, `borrow_date`, `estimated_return_date`, `actual_return_date`, `return_processed_by`, `status`, `notes`, `created_at`, `updated_at`) VALUES
(1, 2, 4, 2, '2025-10-10 09:00:00', '2025-10-12', '2025-10-12 16:00:00', 2, 'returned', NULL, '2025-10-22 09:44:02', '2025-10-22 09:44:02'),
(2, 2, 5, 2, '2025-09-25 14:00:00', '2025-09-28', '2025-09-28 17:00:00', 2, 'returned', NULL, '2025-10-22 09:44:02', '2025-10-22 09:44:02'),
(3, 1, 4, 2, '2025-10-10 10:00:00', '2025-10-12', '2025-10-12 16:00:00', 2, 'returned', NULL, '2025-10-22 09:44:02', '2025-10-22 09:44:02'),
(4, 1, 5, 2, '2025-09-25 15:00:00', '2025-09-28', NULL, NULL, 'borrowed', NULL, '2025-10-22 09:44:02', '2025-10-22 09:44:02');

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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `device_type_id`, `product_name`, `purchase_date`, `location_id`, `status`, `details`, `qr_code`, `is_retired`, `created_at`, `updated_at`) VALUES
(1, 1, 'Canon EOS R5', '2021', 1, 'available', 'Full-frame mirrorless camera with 45MP sensor', 'QR_CANON_R5_001', 0, '2025-10-22 09:44:02', '2025-10-22 09:44:02'),
(2, 2, 'DJI Mavic Air 2', '2020', 3, 'borrowed', '4K drone with 48MP camera', 'QR_DJI_MAVIC_001', 0, '2025-10-22 09:44:02', '2025-10-22 09:44:02'),
(3, 3, 'Godox SL60W', '2019', 2, 'available', '60W LED video light', 'QR_GODOX_SL60_001', 0, '2025-10-22 09:44:02', '2025-10-22 09:44:02');

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
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `role` enum('admin','teacher','student') NOT NULL DEFAULT 'student',
  `remember_token` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `email`, `first_name`, `last_name`, `phone_number`, `role`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'admin', '$2y$10$YourHashedPasswordHere', 'mohammad@edu.turku.fi', 'Mohammad', 'Admin', NULL, 'admin', NULL, '2025-10-22 09:44:02', '2025-10-22 09:44:02'),
(2, 'teacher1', '$2y$10$YourHashedPasswordHere', 'teacher1@edu.turku.fi', 'John', 'Smith', NULL, 'teacher', NULL, '2025-10-22 09:44:02', '2025-10-22 09:44:02'),
(3, 'teacher2', '$2y$10$YourHashedPasswordHere', 'teacher2@edu.turku.fi', 'Sarah', 'Johnson', NULL, 'teacher', NULL, '2025-10-22 09:44:02', '2025-10-22 09:44:02'),
(4, 'aurora', '$2y$10$YourHashedPasswordHere', 'aurora@student.turku.fi', 'Aurora', 'Williams', NULL, 'student', NULL, '2025-10-22 09:44:02', '2025-10-22 09:44:02'),
(5, 'kevin', '$2y$10$YourHashedPasswordHere', 'kevin@student.turku.fi', 'Kevin', 'Brown', NULL, 'student', NULL, '2025-10-22 09:44:02', '2025-10-22 09:44:02');

-- --------------------------------------------------------

--
-- Structure for view `product_current_status`
--
DROP TABLE IF EXISTS `product_current_status`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `product_current_status`  AS SELECT `p`.`id` AS `id`, `p`.`product_name` AS `product_name`, `dt`.`type_name` AS `type_name`, `p`.`purchase_date` AS `purchase_date`, `l`.`location_name` AS `location_name`, `p`.`status` AS `status`, `p`.`details` AS `details`, `p`.`qr_code` AS `qr_code`, CASE WHEN `p`.`status` = 'borrowed' THEN `bh`.`borrower_id` ELSE NULL END AS `current_borrower_id`, CASE WHEN `p`.`status` = 'borrowed' THEN concat(`u`.`first_name`,' ',`u`.`last_name`) ELSE NULL END AS `current_borrower_name`, CASE WHEN `p`.`status` = 'borrowed' THEN `bh`.`borrow_date` ELSE NULL END AS `current_borrow_date`, CASE WHEN `p`.`status` = 'borrowed' THEN `bh`.`estimated_return_date` ELSE NULL END AS `estimated_return_date` FROM ((((`products` `p` left join `device_types` `dt` on(`p`.`device_type_id` = `dt`.`id`)) left join `locations` `l` on(`p`.`location_id` = `l`.`id`)) left join `borrow_history` `bh` on(`p`.`id` = `bh`.`product_id` and `bh`.`status` = 'borrowed')) left join `users` `u` on(`bh`.`borrower_id` = `u`.`id`)) WHERE `p`.`is_retired` = 0 ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `borrow_history`
--
ALTER TABLE `borrow_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `teacher_id` (`teacher_id`),
  ADD KEY `return_processed_by` (`return_processed_by`),
  ADD KEY `idx_product` (`product_id`),
  ADD KEY `idx_borrower` (`borrower_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_borrow_date` (`borrow_date`);

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
  ADD UNIQUE KEY `username` (`username`),
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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `borrow_history`
--
ALTER TABLE `borrow_history`
  ADD CONSTRAINT `borrow_history_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `borrow_history_ibfk_2` FOREIGN KEY (`borrower_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `borrow_history_ibfk_3` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `borrow_history_ibfk_4` FOREIGN KEY (`return_processed_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`device_type_id`) REFERENCES `device_types` (`id`),
  ADD CONSTRAINT `products_ibfk_2` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
