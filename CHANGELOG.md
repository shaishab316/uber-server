# [4.3.0](https://github.com/Alpha-Bytes-Department/uber-server/compare/v4.2.0...v4.3.0) (2025-12-14)


### Features

* add endpoint to retrieve available loans and update transaction model relationships ([9bf01b7](https://github.com/Alpha-Bytes-Department/uber-server/commit/9bf01b706b748e7b1429bb0aaaf90bf043b17d1f))
* add MJML email templates for account verification and password reset ([c8fb21c](https://github.com/Alpha-Bytes-Department/uber-server/commit/c8fb21c09975235f2247c3d150b652ac3cb91371))
* Add trip counts and simplify status validation ([3e3df4e](https://github.com/Alpha-Bytes-Department/uber-server/commit/3e3df4e0163ba13d8cbc793739f0d152cc303dde))
* Add trip rating feature and improve transaction handling ([dd7967e](https://github.com/Alpha-Bytes-Department/uber-server/commit/dd7967ef53b4554ec22760b7fe9499529cea8884))
* Associate loans with available loans by ID ([e338092](https://github.com/Alpha-Bytes-Department/uber-server/commit/e338092d74588e10fdf45fed9b93b2a6c26f0b2f))
* enhance available loan model and service with estimated approval time and loan status ([7647e86](https://github.com/Alpha-Bytes-Department/uber-server/commit/7647e863102ac4c050b5ea313cc9eed5c59a6a24))
* Enhance loan management by adding driver-specific loan data and updating user model ([8b9d3fe](https://github.com/Alpha-Bytes-Department/uber-server/commit/8b9d3fe95e3bc37a7ffe593bec5d6a375a5afa97))
* Enhance trip model with days, user retrieval and validation ([c183ac4](https://github.com/Alpha-Bytes-Department/uber-server/commit/c183ac49e4bd61a360812088ba50e39903b7bae5))
* Implement admin module with overview endpoint and user online status ([0bf2738](https://github.com/Alpha-Bytes-Department/uber-server/commit/0bf2738027442490345e1fab4a250e1579dea2ec))
* Implement admin transaction retrieval via new service ([35b6690](https://github.com/Alpha-Bytes-Department/uber-server/commit/35b669039f3f49bc3466b0d0367ccbb7385f138b))
* Implement admin user approval functionality ([1fdfb60](https://github.com/Alpha-Bytes-Department/uber-server/commit/1fdfb6058ee11ef5aade3086e28ae579dc499c42))
* Implement Available Loan feature with CRUD operations ([37901da](https://github.com/Alpha-Bytes-Department/uber-server/commit/37901da449a96aefd0e65fc6e66618bb45a220f6))
* Implement driver earnings view & fix various issues ([5845757](https://github.com/Alpha-Bytes-Department/uber-server/commit/584575731398682f6860a63d567ceb20ff6c8b50))
* Implement Facebook and Google login with access tokens ([c1c3f0f](https://github.com/Alpha-Bytes-Department/uber-server/commit/c1c3f0f338e45f34fb5a03e5522aab8bd44e2b1a))
* Implement image upload/deletion for NewsFeeds with pagination ([5be947b](https://github.com/Alpha-Bytes-Department/uber-server/commit/5be947bd7f2b75f3f3dc2c9f7e43aaa49b88baee))
* Implement NewsFeed module with CRUD operations and API integration ([411ebb8](https://github.com/Alpha-Bytes-Department/uber-server/commit/411ebb8a71094d12f71fad6440ea1b93310c6680))
* Implement Notification module with real-time updates ([2c19c46](https://github.com/Alpha-Bytes-Department/uber-server/commit/2c19c46f80d52ca91cdcab786374871442d3f4c2))
* Implement payment notifications for driver and user ([d8d0fa3](https://github.com/Alpha-Bytes-Department/uber-server/commit/d8d0fa360ea586bcbc796086d91894ae59aee0ab))
* Implement push notifications via OneSignal and update dependencies ([87797a9](https://github.com/Alpha-Bytes-Department/uber-server/commit/87797a90ed0254c0dca21faf16e16a1363a8a7e3))
* Implement real-time updates and improve trip management ([4635e81](https://github.com/Alpha-Bytes-Department/uber-server/commit/4635e81c2a8494c2b6da4148191a7670651b7da6))
* implement referral system with user references and bonuses ([30de75f](https://github.com/Alpha-Bytes-Department/uber-server/commit/30de75f90bee6c60d4bd792dff2587d8cd6011d1))
* Implement role-based filtering for news feed ([7c24cb1](https://github.com/Alpha-Bytes-Department/uber-server/commit/7c24cb1c2f401ad37860cf836fbd9d2f0fb30b2e))
* Implement user activity tracking module ([fff56a3](https://github.com/Alpha-Bytes-Department/uber-server/commit/fff56a331e8293af5d412a134c4af54826c136b4))
* include user role in chat message retrieval to determine message sender ([0206eb4](https://github.com/Alpha-Bytes-Department/uber-server/commit/0206eb44852c12eeb226fc7d22f6b24cfdb9988a))
* Migrate user model to single onesignal_id ([2441417](https://github.com/Alpha-Bytes-Department/uber-server/commit/244141797778d4d8435e26630ccaedf49fea2311))
* Refactor loan routes and controllers, add new loan management endpoints ([1ae5130](https://github.com/Alpha-Bytes-Department/uber-server/commit/1ae5130c24da502133b829e4ad9b07b6a2189884))
* update referral bonus handling and include refer_id in user return data ([a426be8](https://github.com/Alpha-Bytes-Department/uber-server/commit/a426be8ec5864dddb09e718d1d79329dca521128))
* Use simple-git-hooks for pre-commit tasks ([2cf5d13](https://github.com/Alpha-Bytes-Department/uber-server/commit/2cf5d13951439ff926169fd0ce4300b716934b3b))

# [4.2.0](https://github.com/Alpha-Bytes-Department/uber-server/compare/v4.1.0...v4.2.0) (2025-10-15)


### Features

* :rocket: Implement media upload functionality in chat module ([baa6856](https://github.com/Alpha-Bytes-Department/uber-server/commit/baa6856c5b46640ff5750100791b3534881557b0))
* ✨ Update Prisma client and add avatar URL modifier ([c48f483](https://github.com/Alpha-Bytes-Department/uber-server/commit/c48f4839153067e0c20d3ae4889066ce539c3048))
* 🚚 Rename completeTrip to arrivedTrip and update status ([8784c76](https://github.com/Alpha-Bytes-Department/uber-server/commit/8784c76d26aac9cacf1c6402d63324984a741451))
* Add transaction routes, trip history validation, user check ([abc421a](https://github.com/Alpha-Bytes-Department/uber-server/commit/abc421a14bcc860af1c5d04db3d7719372450c16))
* Implement driver transaction tracking and fix trip payment ([f2c00cc](https://github.com/Alpha-Bytes-Department/uber-server/commit/f2c00cc61da08d62f0f8dfcdde2225fba1af58b9))
* Implement new homepage and backend overhaul, remove old features ([295933a](https://github.com/Alpha-Bytes-Department/uber-server/commit/295933acc3f7de893c540c028ffcf442ab4dcdaf))
* Improve transaction and driver application flows ([08912d5](https://github.com/Alpha-Bytes-Department/uber-server/commit/08912d50f94c43b5d3dbc6db5ff20f2db664500d))
* Update .gitignore, re-enable refresh token route, and refactor controller ([61f7083](https://github.com/Alpha-Bytes-Department/uber-server/commit/61f708385b2e611e78460a59eb675aff3f5ec16f))
* Update message validation and remove updateTripLocation ([1bd4982](https://github.com/Alpha-Bytes-Department/uber-server/commit/1bd498217a6374e84ef2fbb7ca805b1dd7d21c6e))

# [4.1.0](https://github.com/Alpha-Bytes-Department/uber-server/compare/v4.0.0...v4.1.0) (2025-10-11)


### Features

* Adapt transaction service, trip handling, and server startup ([1c992dc](https://github.com/Alpha-Bytes-Department/uber-server/commit/1c992dc0738d58a3fda64727e249518c63bcb127))
* Allow passengers to cancel trips and record cancellation reasons ([7f698b6](https://github.com/Alpha-Bytes-Department/uber-server/commit/7f698b6a919585e6f3dfa10ddf6243ad4dd69912))
* Create wallet on user creation and add User-Wallet relation ([75eaa3a](https://github.com/Alpha-Bytes-Department/uber-server/commit/75eaa3ab44fe842d972213e0ec6f535211c9f7a5))
* Enhance user profile management and account deletion ([d6d86c2](https://github.com/Alpha-Bytes-Department/uber-server/commit/d6d86c220dffc3f8e366d82b831ca2744eba0754))
* Implement payment and transaction modules with Stripe integration ([020e156](https://github.com/Alpha-Bytes-Department/uber-server/commit/020e156bcca230ce029fdc087e3f97f91d9e794f))
* Implement Stripe top-up feature and refactor payment routes ([afa196c](https://github.com/Alpha-Bytes-Department/uber-server/commit/afa196cea80fe0217749c4e97657e3e7f903eb60))
* Implement trip history retrieval for users and admin ([fca1ec0](https://github.com/Alpha-Bytes-Department/uber-server/commit/fca1ec0bd8fd7f37b9c99245121a5d54336e4459))

# [4.0.0](https://github.com/Alpha-Bytes-Department/uber-server/compare/v3.1.0...v4.0.0) (2025-10-08)


### Code Refactoring

* remove `serveResponse` and update `catchAsync` middleware ([2022895](https://github.com/Alpha-Bytes-Department/uber-server/commit/20228959b9b64d86e17c50f817e0dcf065d10b2e))


### BREAKING CHANGES

* The `serveResponse` utility has been removed. The `catchAsync`
middleware now handles sending responses directly, eliminating the need for
explicit `serveResponse` calls inside controllers.

Controllers are now simpler and more centralized, but any controller that
previously relied on `serveResponse` must be updated to work with the new
`catchAsync` behavior.

# [3.1.0](https://github.com/Alpha-Bytes-Department/uber-server/compare/v3.0.0...v3.1.0) (2025-10-08)


### Features

* Implement admin loan management endpoints ([02cb7e6](https://github.com/Alpha-Bytes-Department/uber-server/commit/02cb7e6ff685e265125875cdadaa1d51853a6a59))
* Implement start loan functionality ([548f4b6](https://github.com/Alpha-Bytes-Department/uber-server/commit/548f4b6c7e685a62c1ce536228f011f2bc000577))

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
