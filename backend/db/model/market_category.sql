-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: localhost    Database: market
-- ------------------------------------------------------
-- Server version	8.0.40

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(255) NOT NULL,
  `Image` varchar(500) DEFAULT NULL,
  `Description` text,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category`
--

LOCK TABLES `category` WRITE;
/*!40000 ALTER TABLE `category` DISABLE KEYS */;
INSERT INTO `category` VALUES (1,'Fruits','http://res.cloudinary.com/dr4dgbmun/image/upload/v1733753985/0193abca-5440-7737-8f91-abd005b6200a.jpg','A colorful selection of nature\'s sweetest treats, from crisp apples to tropical mangoes.'),(2,'Vegetables','https://res.cloudinary.com/dr4dgbmun/image/upload/v1733753509/0193abc3-0ce9-7009-8986-c97edde88a96.jpg','Fresh and vibrant veggies packed with nutrients, perfect for every meal.'),(3,'Dairy','https://res.cloudinary.com/dr4dgbmun/image/upload/v1733754026/0193abca-f363-7408-b1f3-645de0659a0a.jpg','Creamy delights like milk, cheese, and yogurt for your daily dose of calcium.'),(4,'Meat','https://res.cloudinary.com/dr4dgbmun/image/upload/v1733754071/0193abcb-9f79-70ec-8563-c0cff33789f5.jpg','Succulent cuts of poultry, beef, and lamb to satisfy every craving.'),(5,'Seafood','https://res.cloudinary.com/dr4dgbmun/image/upload/v1733754113/0193abcc-45a4-7101-b202-60d1075db0ff.jpg','Fresh catches from the ocean, including fish, shrimp, and shellfish.'),(6,'Bakery','https://res.cloudinary.com/dr4dgbmun/image/upload/v1733754153/0193abcc-de4a-7121-8067-bf92e3b76522.jpg','A haven for baked goods lovers—indulge in warm bread, flaky pastries, and decadent cakes.'),(7,'Beverages','https://res.cloudinary.com/dr4dgbmun/image/upload/v1733754191/0193abcd-7631-755f-89ab-71c52e3f2eef.jpg','Refreshing drinks to quench your thirst, from natural juices to fizzy sodas.'),(8,'Grains','http://res.cloudinary.com/dr4dgbmun/image/upload/v1733755875/0193abe7-2b42-76fb-905d-370b3d31ea65.jpg','Staples of many cuisines, our grains collection includes hearty rice, nutritious quinoa, wholesome oats, and versatile pasta. Perfect for creating satisfying meals that are as healthy as they are delicious.'),(9,'Spices & Herbs','https://res.cloudinary.com/dr4dgbmun/image/upload/v1733755926/0193abe7-ee84-72b7-a452-e50b9b22acf8.jpg','Transform your cooking with our premium selection of spices and herbs. Whether you\'re craving the warmth of cinnamon, the zest of garlic, or the freshness of basil, these flavorful additions elevate every dish to new heights.'),(10,'Sauces','https://res.cloudinary.com/dr4dgbmun/image/upload/v1733755964/0193abe8-8291-718a-bf74-ea9d7e5bdc81.jpg','Add a burst of flavor to any dish with our range of sauces and condiments, from tangy ketchup and creamy mayonnaise to exotic hot sauces and savory soy sauce. Perfect for enhancing your meals and creating new taste experiences!'),(11,'Test','http://res.cloudinary.com/dr4dgbmun/image/upload/v1733845491/0193b13e-96fc-70ef-82ff-3c8b93d0e408.jpg','Skibidi toilet');
/*!40000 ALTER TABLE `category` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-12-16  9:23:26
