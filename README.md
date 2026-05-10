# Healthcare Assistance & Patient Monitoring System

## Overview

This project is a comprehensive healthcare mobile application developed using React Native, Node.js, Express, and MongoDB. The application is designed to support general users, elderly individuals, Alzheimer patients, caregivers, and guardians through an interconnected healthcare ecosystem.

The system combines healthcare assistance, memory support, patient monitoring, emergency handling, and caregiver coordination into a single platform.



# Features

## 1. Home Remedies Module

A publicly accessible module that provides:

* Natural remedies for common illnesses
* Search-based illness lookup
* Remedy suggestions for minor health conditions

### Key Points

* No login/signup required
* General wellness support feature
* Fast illness search and remedy display



## 2. Doctor Directory Module

A healthcare directory where users can:

* View doctors based on specialization
* Access doctor details and contact information
* Search doctors according to medical needs

### Key Points

* Authentication required for complete access
* Organized doctor categorization
* Easy navigation and search



# Alzheimer Care Module

The Alzheimer module is one of the core intelligent systems of the application.

It focuses on helping Alzheimer patients through:

* Memory assistance
* Cognitive support
* Caregiver coordination
* Emergency management
* Safety monitoring



## Alzheimer Patient Features

### Memory Game System

A cognitive training feature where:

* Caregivers upload family member images and questions
* Patients play recognition-based memory games
* Scores are calculated automatically
* Results are shared with caregivers and guardians

### Notes & Task Assistance

Patients can:

* View notes added by caregivers
* Manage reminders and daily tasks
* Follow routines and medicine schedules

### Emergency Contacts

Patients can instantly contact:

* Caregivers
* Guardians
* Family members

### Reminder & Notification System

The app continuously sends:

* Medication reminders
* Daily routine reminders
* Task notifications

Notifications are synchronized between:

* Patient
* Caregiver
* Guardian



# Caregiver Dashboard

The caregiver dashboard acts as a patient management and monitoring system.

Caregivers can:

* Create memory game questions
* Upload family images
* Track memory game scores
* Add notes and reminders
* Set daily tasks
* Configure geofence safe zones
* Monitor patient location



# Guardian Dashboard

The guardian dashboard provides monitoring support for family members.

Guardians can:

* Receive emergency alerts
* View patient location
* Monitor memory game scores
* View important patient updates

This dashboard mainly provides view-only monitoring access.



# Elderly Care Module

The elderly care module supports elderly users through:

* Memory lane / nostalgic support
* Health tracking
* Notes and reminders
* Emergency support
* Optional caregiver linkage

The elderly module functions independently from the Alzheimer module and supports separate caregiver relationships.



# Geofencing & Location Tracking

The application implements geofencing for patient safety.

### Working

* Caregiver sets a safe zone location and radius
* Patient device continuously shares GPS location
* System checks whether the patient is inside the safe zone

### If Patient Exits Safe Zone

* Alerts are sent to:

  * Caregiver
  * Guardian
* Live location is shared

### Technologies Used

* GPS Tracking
* Geolocation APIs
* Geocoding
* Radius-based distance calculation



# Sensor-Based Emergency Detection

The system uses smartphone sensors such as:

* Accelerometer
* Gyroscope
* GPS

for emergency and fall detection.

## Fall Detection Flow

* Sudden abnormal movement is detected
* System waits for user confirmation
* If no response is received within a fixed time:

  * Emergency alerts are triggered
  * Caregivers and guardians are notified



# Authentication & Access Control

The application uses:

* Global authentication system
* Feature-specific onboarding
* Relationship-based dashboard access

Users dynamically receive dashboards depending on their relationship in the system:

* Patient
* Caregiver
* Guardian
* General user



# Technology Stack

## Frontend

* React Native
* Expo Router

## Backend

* Node.js
* Express.js

## Database

* MongoDB

## Additional Technologies

* Expo Location
* Expo Sensors
* Notifications
* Geofencing Logic



# Project Goals

The goal of this project is to create a healthcare ecosystem that:

* Enhances patient safety
* Supports Alzheimer and elderly patients
* Assists caregivers and family members
* Provides emergency monitoring
* Encourages cognitive engagement
* Creates a connected healthcare support platform



# Future Enhancements

* Real-time hospital integration
* Smart wearable integration



# Team Collaboration Workflow

Development follows a branch-based Git workflow:

* Features are developed on separate branches
* Pull Requests are used for merging
* Main branch remains stable and production-ready



# Conclusion

This project aims to build a connected healthcare support system that combines healthcare accessibility, patient monitoring, memory assistance, emergency detection, and caregiver coordination into a single intelligent platform.

The application focuses especially on improving the quality of life for Alzheimer and elderly patients while supporting caregivers and family members through smart monitoring and communication systems.
