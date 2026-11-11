# Private fleet: fields and preserved behavior

This slice targets the development backend routes, not the older main deployment.

| Data / behavior                                 | Backend source                                              | Frontend treatment                                                                                                                                                        |
| ----------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Name, email, phone, avatar, active account      | GET /drivers user projection                                | Roster and driver dialog. A missing portrait uses a neutral person icon, not another person's image.                                                                      |
| Vehicle type and plate                          | GET /drivers                                                | Roster, search and detail; no vehicle details are removed.                                                                                                                |
| Model, colour, year and insurance               | GET /drivers                                                | Driver dialog, with missing values explicit.                                                                                                                              |
| Availability                                    | status from GET /drivers                                    | Status filters and status text. These filter loaded records; they are not full-fleet aggregates.                                                                          |
| Profile rating and delivery count               | rating, totalDeliveries                                     | Preserved as backend profile values; no review count or payout is inferred.                                                                                               |
| Creation date, profile location                 | createdAt, currentLocation                                  | Driver dialog; location is explicitly a last-reported profile coordinate, not live shipment tracking.                                                                     |
| Assigned deliveries and retained failed custody | GET /shipments, driverId, status, actualPickup, returnState | Detail dialog matches paged shipment records; more records load explicitly. Missing matches are not presented as no work until every page is loaded.                      |
| Grid/list, search, status filters               | Existing frontend behavior                                  | Preserved with labels and pressed states. Search adds email. Pagination stays available even when a loaded-page filter matches nothing.                                   |
| Invitation creation                             | POST /driver-invitations {email}                            | Validated/normalized email. Token is returned once and retained only in component memory, with copy fallback and a leave-page warning. No token-bearing URL is generated. |
| Invitation history/revocation                   | GET latest 50; DELETE owned pending invitation              | Dates and terminal states shown; explicit revocation confirmation. No member removal/transfer is invented.                                                                |
| New driver acceptance                           | Existing /join-fleet                                        | Preserved. Owners share the normal page address and token separately; no automatic email delivery is claimed.                                                             |
| Existing unlinked driver                        | POST /driver-invitations/accept-existing {token}            | Added to the driver overview only when the authenticated profile explicitly has businessId=null. No client account ID is submitted.                                       |

Internal identifiers connect actions and list keys; hashes, credentials and private
notification preferences are not exposed to business users. Backend access checks
remain authoritative, including expired/replayed invitations and one membership.

The former earnings number was 40% of loaded shipment prices, with no payroll or
payout backend contract. It is replaced on the fleet screen with actual vehicle,
contact and operational profile information. Other role screens and shipment
commands are deliberately unchanged in this slice; their remaining integration
work is tracked in frontend-integration.md.

New cursor queries use separate keys rather than changing the response shape seen
by legacy consumers. Account-switch query clearing and existing role/session guards
remain in force. The business workspace also remounts by account ID to clear
selected driver details and one-time token state when identity changes. Existing
driver enrollment is keyed by driver profile ID. Invitation writes are not automatically retried: a network error
can be an uncertain outcome; refresh history before creating another invitation.
