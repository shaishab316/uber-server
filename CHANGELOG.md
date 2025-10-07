# [3.0.0](https://github.com/Alpha-Bytes-Department/uber-server/compare/v2.4.0...v3.0.0) (2025-10-07)


### Code Refactoring

* **router:** switch injectRoutes to object-based syntax ([8e5a515](https://github.com/Alpha-Bytes-Department/uber-server/commit/8e5a515531a0922321043785fb6a8af8b8e96e50))


### Features

* Implement loan module for drivers ([a4656fa](https://github.com/Alpha-Bytes-Department/uber-server/commit/a4656fa7b7f839ec4c404933087b445671c48c7c))


### BREAKING CHANGES

* **router:** - `injectRoutes` now accepts an object (`TRoutes`) instead of an array of route configs.
- Updated all route modules to use the new object syntax.
- Loan route path changed from '/' to '/available'.
- LoanServices no longer has a `create` method.

# [2.4.0](https://github.com/Alpha-Bytes-Department/uber-server/compare/v2.3.0...v2.4.0) (2025-10-07)


### Features

* Implement estimated fare calculation and improve driver search retries ([ebf6453](https://github.com/Alpha-Bytes-Department/uber-server/commit/ebf6453a07dd3b7a4459a585c583ae2a42b5a2e2))
* Implement trip acceptance and driver exclusion logic ([fd19530](https://github.com/Alpha-Bytes-Department/uber-server/commit/fd19530d973a1c0752365e4eea333b230600acab))

# [2.3.0](https://github.com/Alpha-Bytes-Department/uber-server/compare/v2.2.0...v2.3.0) (2025-10-06)


### Features

* Disable default Socket.IO namespace ([f616605](https://github.com/Alpha-Bytes-Department/uber-server/commit/f616605bbf00fe636d5fae5807353404351fc8ec))
* Include statusCode in global error response ([1856437](https://github.com/Alpha-Bytes-Department/uber-server/commit/185643752da14a0167597fbe7b7945fa32db3cec))
* Remove driver from available list upon trip acceptance and disconnect ([4e45862](https://github.com/Alpha-Bytes-Department/uber-server/commit/4e45862e282ae3a6780338da0ffc2664fbf8b3ac))

# [2.2.0](https://github.com/Alpha-Bytes-Department/uber-server/compare/v2.1.0...v2.2.0) (2025-10-05)


### Features

* Rename 'trip_info' socket event to 'trip_notification' ([a309452](https://github.com/Alpha-Bytes-Department/uber-server/commit/a309452138ed39186fc87342787583263de3de38))
* Update chat's last message on message creation/deletion ([35fbc50](https://github.com/Alpha-Bytes-Department/uber-server/commit/35fbc5064c791a6e792db113581dbed81cdd9c0a))

# [2.1.0](https://github.com/Alpha-Bytes-Department/uber-server/compare/v2.0.0...v2.1.0) (2025-10-05)


### Features

* Enhance chat and trip socket events with structured responses and notifications ([d0e4e82](https://github.com/Alpha-Bytes-Department/uber-server/commit/d0e4e8242a883d8131ec3c842e199a8322bae9af))
* Enhance socket event handling with Zod validation and specific error messages ([2fe8b5f](https://github.com/Alpha-Bytes-Department/uber-server/commit/2fe8b5fe489e5754f0102ad0caa7a26bb4f2c4a3))

# [2.0.0](https://github.com/Alpha-Bytes-Department/uber-server/compare/v1.3.0...v2.0.0) (2025-10-05)


### Features

* **socket:** refactor for namespaces and plugin-based architecture ✨ ([78d8cb7](https://github.com/Alpha-Bytes-Department/uber-server/commit/78d8cb73b6e263bbefbf0af4a7d891f66315642d))


### BREAKING CHANGES

* **socket:** - Socket.IO now requires connecting to a valid namespace; connections to the default namespace '/' are rejected.
- Online user tracking is now namespace-specific.
- Socket plugin system introduced; handlers now receive the Namespace instance instead of the Server.
- Event emissions for modules (e.g., Trip) must use their corresponding namespace.
- Type definitions updated to reflect the new structure.

This restructuring improves modularity, scalability, and separation of concerns.

# [1.3.0](https://github.com/Alpha-Bytes-Department/uber-server/compare/v1.2.0...v1.3.0) (2025-10-05)


### Features

* Add OTP fields to Trip model and refactor trip omission ([d36460a](https://github.com/Alpha-Bytes-Department/uber-server/commit/d36460a45ee00be028acd480cee44e29e9c84d20))
* Enhance Socket handling with user authentication ([c178f8b](https://github.com/Alpha-Bytes-Department/uber-server/commit/c178f8b751d28794724af2bfbfc56ce983f56a04))
* Enhance socket handling, add trip socket, and refine message deletion ([fa50bad](https://github.com/Alpha-Bytes-Department/uber-server/commit/fa50bad0e431e7b0d8767e09532e0ebbb0d7feb1))
* Exclude OTP fields from trip responses ([bb24c7f](https://github.com/Alpha-Bytes-Department/uber-server/commit/bb24c7f4318749938b23bfa5d8583ab30ef880e8))
* Implement chat and message deletion, enhance validation ([7dbf6d5](https://github.com/Alpha-Bytes-Department/uber-server/commit/7dbf6d5396077bc5d3c7e635446cb8cfca26e46f))
* Implement chat socket and message handling ([cf77a1f](https://github.com/Alpha-Bytes-Department/uber-server/commit/cf77a1f5b7245ab1ce9b8a746072a338b1a37c69))
* Implement driver trip completion flow ([3f0fc9f](https://github.com/Alpha-Bytes-Department/uber-server/commit/3f0fc9f51f3c3aa5159ad3d722e8baf09e5a6f72))
* Implement driver trip start functionality ([40c743d](https://github.com/Alpha-Bytes-Department/uber-server/commit/40c743d15cd26970c29d35fc4ccba247f5d118cd))
* Implement Socket Plugin & Driver Socket ([4b6d28b](https://github.com/Alpha-Bytes-Department/uber-server/commit/4b6d28be5beb66a399f9bc68f4235ac0951ceb27))
* Implement trip proximity notifications ([3a736fe](https://github.com/Alpha-Bytes-Department/uber-server/commit/3a736fe40b8206b1480282483f582f179f8c4068))
* Implement trip request, location update and start trip functionalities ([c7d0a45](https://github.com/Alpha-Bytes-Department/uber-server/commit/c7d0a455f1e84670703a0cdba8d3089a6c789126))
* Launch started trip on socket connect and fix trip socket emit ([ac9f293](https://github.com/Alpha-Bytes-Department/uber-server/commit/ac9f2935243af6b2d767ad3620183a3096c59708))
* Refactor socket plugin and update dependencies ([1f77c95](https://github.com/Alpha-Bytes-Department/uber-server/commit/1f77c952d74c5b5bbe74b9b2a6e7d2a707aede99))
* Replace `colors` with `chalk` for terminal styling ([dccc742](https://github.com/Alpha-Bytes-Department/uber-server/commit/dccc74236f21e189823583e3da53ebd506245ac5))
* serve static 404 page and update health endpoint ([13f5e61](https://github.com/Alpha-Bytes-Department/uber-server/commit/13f5e61e956c6f92d36518318727d40ad5c88185))

# [1.2.0](https://github.com/Alpha-Bytes-Department/uber-server/compare/v1.1.0...v1.2.0) (2025-09-25)


### Features

* **release:** Disable success/fail comments on GitHub releases ([3d0eee3](https://github.com/Alpha-Bytes-Department/uber-server/commit/3d0eee3229737c4e2bc09d9d9de9d7226981eed9))

# [1.1.0](https://github.com/Alpha-Bytes-Department/uber-server/compare/v1.0.0...v1.1.0) (2025-09-25)


### Bug Fixes

* do html more awesome ([95c4fbd](https://github.com/Alpha-Bytes-Department/uber-server/commit/95c4fbd982362e23dff6a76b1d9086e3874de544))


### Features

* Add driver trip location update functionality ([f80fabf](https://github.com/Alpha-Bytes-Department/uber-server/commit/f80fabf44af36518ed2cbd204c377b7661cc6976))
* Add route to retrieve messages for a specific chat ([dd39900](https://github.com/Alpha-Bytes-Department/uber-server/commit/dd399005cee115a74441727aacb597f36efed621))
* Implement Chat and Message features ([30217a8](https://github.com/Alpha-Bytes-Department/uber-server/commit/30217a81d2196406de22ece63cc4a2112b9c29cb))
* Implement chat inbox, retrieval and deletion ([cb82ab1](https://github.com/Alpha-Bytes-Department/uber-server/commit/cb82ab176ced48c8d009152b8f48e0734d1a091b))
* Implement driver trip acceptance ([b64cf6b](https://github.com/Alpha-Bytes-Department/uber-server/commit/b64cf6b43444bcccf528ddf1bf8199099198507b))
* Implement log management UI and API endpoints ([063e1ff](https://github.com/Alpha-Bytes-Department/uber-server/commit/063e1ff524d2112f14f7b1524f2d2da9cdc9fa36))
* Implement message retrieval and management ([adfdbf2](https://github.com/Alpha-Bytes-Department/uber-server/commit/adfdbf2c8cdf45aa78b0fd468778197b04b2e343))
* Implement trip rejection and cancellation tracking ([d9dc2c2](https://github.com/Alpha-Bytes-Department/uber-server/commit/d9dc2c2718db5f654ce94a767d7a6abbd6791d4d))
* Retry finding driver if initially not found ([68b1459](https://github.com/Alpha-Bytes-Department/uber-server/commit/68b1459bfe1bfde0474d247c97b95efc9f7e5646))

# 1.0.0 (2025-09-13)


### Features

* Add basic login and profile pages with cookie-based authentication ([4d26059](https://github.com/Alpha-Bytes-Department/uber-server/commit/4d260594914f57cb0391b63215f0d52447591924))
* Add logging for email verification and admin seed, add sleep util ([a6456c7](https://github.com/Alpha-Bytes-Department/uber-server/commit/a6456c78d6d3e38127f20345be4b354d14481b0d))
* Add strip-ansi for removing colors from logs ([918e6d5](https://github.com/Alpha-Bytes-Department/uber-server/commit/918e6d5847f37d4535dee3898258542656d55724))
* Add user location update functionality ([3f83bc5](https://github.com/Alpha-Bytes-Department/uber-server/commit/3f83bc5a4125961a65934297d50a16ae706151ee))
* added prisma ([7e081e1](https://github.com/Alpha-Bytes-Department/uber-server/commit/7e081e17930319d41382091d845ad34f4c9b155c))
* Database index setup and cleanup ([ff03c28](https://github.com/Alpha-Bytes-Department/uber-server/commit/ff03c28254ab61cff8ca7cd2805d7fb913db2f6c))
* Enhance socket handling and user data security ([2653728](https://github.com/Alpha-Bytes-Department/uber-server/commit/2653728688e0c673dc9d9e80fc5f29e8b5bc1e75))
* Grant write permissions to release workflow ([41693b9](https://github.com/Alpha-Bytes-Department/uber-server/commit/41693b9bc1f5c86862045c53f50b183f70a892f2))
* Implement account verification OTP functionality ([870c13c](https://github.com/Alpha-Bytes-Department/uber-server/commit/870c13ca23f849e48e7e4adeca8724d4e72a3a8d))
* Implement available driver and trip functionalities ([276a19e](https://github.com/Alpha-Bytes-Department/uber-server/commit/276a19ed7b8d4327c026d3ed1df0a260470e917a))
* Implement change password functionality ([561ce62](https://github.com/Alpha-Bytes-Department/uber-server/commit/561ce6299a321686d409a810395175e381ae355c))
* Implement driver application process ([f7eb1ab](https://github.com/Alpha-Bytes-Department/uber-server/commit/f7eb1ab8051c6976eea7de47b5bfdd5763aa174a))
* Implement driver approval flow for admins ([83b15d1](https://github.com/Alpha-Bytes-Department/uber-server/commit/83b15d10982ea6894f11ec804779c214f02662be))
* Implement driver availability feature ([e4e16a4](https://github.com/Alpha-Bytes-Department/uber-server/commit/e4e16a45ff376761f312553a7369bec524153470))
* Implement forgot password functionality ([e28668d](https://github.com/Alpha-Bytes-Department/uber-server/commit/e28668d11e911153e4e6feaf17091e5dbaeda988))
* Implement location utils using Google Maps Distance Matrix API ([19c085a](https://github.com/Alpha-Bytes-Department/uber-server/commit/19c085a295428a5208f6e1d90a56ba1a06c1b046))
* Implement log retrieval endpoints and UI ([a9697d7](https://github.com/Alpha-Bytes-Department/uber-server/commit/a9697d7d9361a9fb79cd37247da57ecdb5b212fa))
* Implement password reset via OTP verification ([85f7025](https://github.com/Alpha-Bytes-Department/uber-server/commit/85f7025b606c8cd27c7f986fc9afeae3a7fe4c0b))
* Implement reset password functionality ([98c5925](https://github.com/Alpha-Bytes-Department/uber-server/commit/98c5925816c2f96077bee09e848ff9661b4dca46))
* Implement trip creation and driver assignment ([afe9dae](https://github.com/Alpha-Bytes-Department/uber-server/commit/afe9dae25a7baa4f8b7993db4bb495cf1f5d9ef5))
* Implement Trip module ([b53da6a](https://github.com/Alpha-Bytes-Department/uber-server/commit/b53da6a45cf14317f136d5cb55c6e07ca9ab3a87))
* Implement Uber Dashboard UI with iframe navigation ([de7c2bc](https://github.com/Alpha-Bytes-Department/uber-server/commit/de7c2bc77ff7638b13ee04f0a6f75f2f1fb198b3))
* Implement user profile edit and enhance profile retrieval ([fcc503d](https://github.com/Alpha-Bytes-Department/uber-server/commit/fcc503d181b9f84fcb13178b9e656f5d971595c8))
* Integrate Socket.IO for real-time communication ([cf4a613](https://github.com/Alpha-Bytes-Department/uber-server/commit/cf4a61329e78e9d504eed155686fac4eacb3fc6a))
* Setup DB indexes for trips, users, and available_drivers ([20ab62e](https://github.com/Alpha-Bytes-Department/uber-server/commit/20ab62e5ae1d21b64bca3cc2996a4051fe8061c0))
* Simplify user update logic and validation ([cab0fa0](https://github.com/Alpha-Bytes-Department/uber-server/commit/cab0fa0728fee90bda867c598f6a9563414ae4c0))
* Update project repository URLs and add badges ([cea1e08](https://github.com/Alpha-Bytes-Department/uber-server/commit/cea1e08f9b7174479184c8516da86caf53c85366))
* Validate email/phone uniqueness on user update ([2ab4168](https://github.com/Alpha-Bytes-Department/uber-server/commit/2ab41681c4cc7a9b2ebbbc9896f4b78427476a16))
