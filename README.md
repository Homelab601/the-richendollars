# The Richendollars

## Overview

The Richendollars is a self-hosted family dashboard and homelab platform built with:

* React
* Vite
* Node.js
* Express
* Socket.IO
* Docker

The goal of the platform is to create a central ecosystem for:

* family organization
* live synchronization
* homelab monitoring
* quick notes
* weather
* infrastructure management
* future automation
* AI integrations

---

# v1.0 Core Features

## Dashboard

* Modern homepage dashboard
* Mobile-friendly layout
* Responsive design
* Family-oriented interface

## Search System

* Article search functionality
* Quick content filtering

## Fridge Notes / Quick Notes

* Shared family notes system
* Real-time synchronization
* Persistent storage

## Weather Dashboard

* Expanded weather interface
* Forecast support
* Horizontal dashboard layout
* Smart card-based UI

## Admin Panel

* Password-protected admin area
* Backup exporting
* Infrastructure visibility
* Homelab dashboard

## Homelab Monitoring

Live infrastructure monitoring includes:

* Backend status
* Database health
* Docker detection
* Connected devices
* Memory usage
* Host information
* Uptime monitoring
* WebSocket status

## Real-Time Sync

Socket.IO powers:

* live article updates
* fridge note synchronization
* connected device tracking

## Backup System

JSON backup exports include:

* articles
* fridge notes
* metadata
* infrastructure information

## Docker Support

The application is fully Dockerized using:

* Docker
* Docker Compose

Includes:

* containerized frontend
* containerized backend
* persistent volume support
* production-ready deployment structure

## Git Version Control

* Git repository initialized
* v1.0 snapshots committed
* rollback support available

---

# Technology Stack

## Frontend

* React
* Vite
* CSS

## Backend

* Node.js
* Express
* Socket.IO

## Infrastructure

* Docker
* Docker Compose

## Storage

* Local JSON database (`db.json`)

---

# Running The App

## Development Mode

Run:

npm run dev

Frontend:

http://localhost:5173

Backend:

http://localhost:3001

Health endpoint:

http://localhost:3001/health

---

# Docker Deployment

## Build and Run

docker compose up --build

## Stop Containers

docker compose down

---

# Admin Access

Admin tools are protected by a local password system.

Admin features include:

* backup exporting
* homelab monitoring
* infrastructure visibility
* system health information

---

# Current Infrastructure Status

## v1.0 Supports

* Dockerized deployment
* backend health monitoring
* uptime tracking
* websocket monitoring
* memory statistics
* live infrastructure visibility

## Future Plans

* Ryze deployment
* Tailscale remote access
* user/device profiles
* Viktor AI integration
* native mobile app support
* automation systems
* deeper homelab integrations

---

# Project Structure

src/
  components/
  App.jsx
  App.css

server.js
db.json

Dockerfile
docker-compose.yml
README.md

---

# Development Notes

This project originally started from the default React + Vite template and evolved into a full-stack homelab-ready platform.

Vite provides:

* Hot Module Reloading (HMR)
* fast frontend development
* modern build tooling

Official plugins:

* @vitejs/plugin-react
* @vitejs/plugin-react-swc

---

# Version

## The Richendollars v1.0 Core

Created by:

Kyle Richendollar
