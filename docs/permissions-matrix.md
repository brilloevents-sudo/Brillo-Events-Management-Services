# Role-Based Access Control (RBAC) Permissions Matrix

| Permission Action | Admin | Sales | Operations | Finance | Talent/PA | Read-Only |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| `booking:create` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `booking:edit` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `booking:cancel` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `booking:confirm_secured` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `hold:create` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `hold:extend` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `talent:create` | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `talent:edit_profile` | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `talent:upload_photo` | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `talent:view_sensitive` | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| `assignment:assign` | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `assignment:reassign` | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `quote:create` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `quote:approve` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `contract:generate` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `contract:upload_signed` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `payment:record` | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| `payment:verify` | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| `payment:reject` | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| `expense:create` | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| `paluwal:create` | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| `paluwal:approve` | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| `payout:record` | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| `import:execute` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `conflict:resolve` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `inbox:read` | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| `inbox:send` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `settings:edit` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## Least Privilege Enforcement
- Sales staff cannot view sensitive talent private bank details, advances, or payout records.
- Operations staff cannot verify payments or authorize cash ledger debits.
- Finance staff cannot reassign talent or modify confirmed performance schedules without operations signoff.
- Only Admin has authority to resolve source conflicts, commit imports, and alter system settings.
