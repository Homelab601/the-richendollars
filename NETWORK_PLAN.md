# Homelab601 Network Plan

## Core Infrastructure

| Device | Purpose | IP Address |
|---|---|---|
| Router/Gateway | Network Gateway | 192.168.1.1 |
| Main PC | Primary Workstation | 192.168.1.2 |
| Managed Switch | Network Infrastructure | 192.168.1.10 |
| Ryze | Proxmox Host | 192.168.1.20 |
| Bard | NAS / Storage | 192.168.1.21 |

---

# VM / Service Range

Reserved range for VMs and services:

192.168.1.30+

---

# Planned Services

| Service | Purpose | Planned IP |
|---|---|---|
| The Richendollars | Family Dashboard | 192.168.1.30 |
| PinkWard | Monitoring Stack | 192.168.1.31 |
| Viktor | Local AI / Automation | 192.168.1.40 |

---

# Monitoring Stack

PinkWard stack includes:

- Uptime Kuma
- Grafana
- Prometheus
- Node Exporter

---

# Remote Access

Remote access powered by:

- Tailscale
- Private mesh VPN
- No public port forwarding required

---

# Ecosystem Naming

| Name | Purpose |
|---|---|
| Homelab601 | Overall ecosystem |
| Ryze | Proxmox host |
| The Richendollars | Main dashboard app |
| Bard | Storage NAS |
| PinkWard | Monitoring stack |
| Viktor | AI / automation server |

---

# Future Expansion

Reserved future service ranges:

| Range | Purpose |
|---|---|
| 192.168.1.30-39 | Infrastructure Services |
| 192.168.1.40-49 | AI Services |
| 192.168.1.50-59 | Media / Game Services |

---

# Notes

- Static DHCP reservations preferred
- Docker services primarily hosted on VMs
- Ryze acts as central compute node
- Bard acts as centralized storage
- PinkWard handles monitoring and observability