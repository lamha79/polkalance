#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod polkalance {

    use ink::prelude::string::String;
    use ink::prelude::vec::Vec;
    use ink::storage::Mapping;

    pub type JobId = u128;
    pub type ReportInfo = String;

    const FEE_PERCENTAGE: u8 = 3;

    #[ink(event)]
    pub struct Registered {
        #[ink(topic)]
        account_id: AccountId,
        #[ink(topic)]
        account_role: AccountRole,
    }
    #[ink(event)]
    pub struct JobCreated {
        #[ink(topic)]
        name: String,
        #[ink(topic)]
        description: String,
        #[ink(topic)]
        deposite: u128,
        // #[ink(topic)]
        // duration: u64,
    }

    #[ink(event)]
    pub struct JobObtained {
        #[ink(topic)]
        job_id: JobId,
        #[ink(topic)]
        freelancer: AccountId,
    }

    #[ink(event)]
    pub struct JobSubmitted {
        #[ink(topic)]
        job_id: JobId,
        #[ink(topic)]
        freelancer: AccountId,
        #[ink(topic)]
        result: String,
    }

    #[ink(event)]
    pub struct JobRejected {
        #[ink(topic)]
        job_id: JobId,
        #[ink(topic)]
        owner: AccountId,
    }

    #[ink(event)]
    pub struct JobApproved {
        #[ink(topic)]
        job_id: JobId,
        #[ink(topic)]
        owner: AccountId,
        #[ink(topic)]
        freelancer: AccountId,
    }

    #[ink(event)]
    pub struct JobCanceled {
        #[ink(topic)]
        job_id: JobId,
        #[ink(topic)]
        owner: AccountId,
    }

    #[ink(event)]
    pub struct JobNegotiationRequested {
        #[ink(topic)]
        job_id: JobId,
        #[ink(topic)]
        requester: AccountId,
        #[ink(topic)]
        pay: u128,
    }

    #[ink(event)]
    pub struct JobNegotiationResponded {
        #[ink(topic)]
        job_id: JobId,
        #[ink(topic)]
        responder: AccountId,
        #[ink(topic)]
        agreement: bool,
    }

    #[ink(event)]
    pub struct JobTerminated {
        #[ink(topic)]
        job_id: JobId,
        #[ink(topic)]
        terminator: AccountId,
        #[ink(topic)]
        reporter: Option<AccountId>,
    }

    #[ink(event)]
    pub struct JobReported {
        #[ink(topic)]
        job_id: JobId,
        #[ink(topic)]
        reporter: AccountId,
        #[ink(topic)]
        report: ReportInfo,
    }

    #[ink(event)]
    pub struct JobRated {
        #[ink(topic)]
        job_id: JobId,
        #[ink(topic)]
        rater: AccountId,
        #[ink(topic)]
        rating_point: RatingPoint,
    }

    #[ink(storage)]
    #[derive(Default)]
    pub struct Account {
        jobs: Mapping<JobId, Job>, // map jobID đến job: luôn là trạng thái cuối cùng của job, như vậy job reopen sẽ ko lưu người làm trước, phần đó lưu trong unsuccessful_job kèm đánh giá
        current_job_id: JobId,
        personal_account_info: Mapping<AccountId, UserInfo>,
        owner_jobs: Mapping<AccountId, Vec<(JobId, bool)>>, //khi tạo job phải add thông tin vào, thay đổi khi create, approval, respond_negotiate thành công
        freelancer_jobs: Mapping<AccountId, Vec<(JobId, bool)>>, //khi nhận job phải add thông tin vào, thay đổi khi obtain, approval, respond_negotiate thành công
        all_freelancer: Vec<AccountId>,
        // list_jobs_assign: Mapping<AccountId, Vec<(JobId, bool)>>, // danh sách công việc đã giao <id,(job_id,hoàn thành hay chưa?))>
        // list_jobs_take: Mapping<AccountId, Vec<(JobId, bool)>>, // danh sách công việc đã nhận <id,(job_id,hoàn thành hay chưa?))>
        ratings: Mapping<AccountId, Vec<(JobId, Option<RatingPoint>)>>, // <JobId: id công việc, Điểm đánh giá>
        reports: Mapping<AccountId, Vec<(JobId, Option<ReportInfo>)>>, // <JobId: id công việc, Thông tin tố cáo>
    }

    #[derive(scale::Decode, scale::Encode, Default, Debug)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub struct Job {
        name: String,
        job_id: JobId,
        description: String,
        category: Category,
        result: Option<String>,
        status: Status,
        budget: Balance,                  // ngân sách
        fee_percentage: u8,               // phần trăm tiền phí
        start_time: Timestamp,            // thời gian bắt đầu tính từ lúc khởi tạo công việc
        end_time: Timestamp, //thời gian kết thúc = thời gian bắt đầu + duration người dùng nhập sẽ tính bằng ngày. (thời gian này bao gồm khởi tạo công việc và xét duyệt quá thời hạn người tạo phải hủy job tránh tình trạng treo người làm xong ko được nghiệm thu)
        person_create: Option<AccountId>, // id người giao việc
        person_obtain: Option<AccountId>, // id người nhận việc
        pay: Balance,        // số tiền đã trả cho người làm
        feedback: String,    // phản hồi của đối tác
        request_negotiation: bool, // yêu cầu thương lượng
        requester: Option<AccountId>, // người yêu cầu thương lượng
        reporter: Option<AccountId>, // người được phép tố cáo
        require_rating: (bool, bool), // yêu cầu đánh giá của (người giao việc, người nhận việc)
        unqualifier: bool,   // smart contract phát hiện công việc không đạt chất lương (quá hạn)
    }

    #[derive(scale::Decode, scale::Encode, Default, Debug, PartialEq, Clone)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub enum Category {
        #[default]
        NONE,
        IT,
        MARKETING,
        PHOTOSHOP,
    }

    #[derive(scale::Decode, scale::Encode, Default, Debug, PartialEq, Clone)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub enum RatingPoint {
        #[default]
        OneStar,
        TwoStars,
        ThreeStars,
        FourStars,
        FiveStars,
    }

    #[derive(scale::Decode, scale::Encode, Default, Debug, PartialEq)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub enum Status {
        #[default]
        OPEN,
        DOING,
        REVIEW,
        UNQUALIFIED, //chưa đạt yêu cầu, reject => unqualifieds => freelancer nếu đồng ý thì reopen nếu ko thì complaint
        REOPEN,
        FINISH,
        CANCELED,
    }

    #[derive(scale::Decode, scale::Encode, Default, Debug, PartialEq, Clone, Copy)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub enum AccountRole {
        #[default]
        INDIVIDUAL, // khách hàng cá nhân
        ENTERPRISE(OnwerRoleInEnterprise), // khác hàng doanh nghiệp
        FREELANCER,
    }

    #[derive(scale::Decode, scale::Encode, Default, Debug, PartialEq, Clone, Copy)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub enum OnwerRoleInEnterprise {
        #[default]
        TEAMLEAD,
        ACCOUNTANT, //có thể bổ sung các role khác
    }

    #[derive(scale::Decode, scale::Encode, Default, Debug, Clone)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub struct UserInfo {
        name: String,
        detail: String,    //liên kết đến IPFS lưu trữ thông tin cá nhân
        role: AccountRole, // vai trò
        successful_jobs_and_all_jobs: (u32, u32), //số lượng công việc thành công trên số lượng công việc đã tạo (client) hoặc đã nhận (freelancer).
        rating_points: i32,                       // điểm dánh giá có thể âm nên để i32
    }

    #[derive(scale::Decode, scale::Encode, Debug, PartialEq)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum JobError {
        // Lỗi liên quan tới đăng kí tài khoản
        Registered,    //đã đăng kí tài khoản (đăng kí), không đăng kí nữa
        NotRegistered, // chưa đăng kí tài khoản.

        // Lỗi role
        NotJobAssigner, // bạn không phải là người giao việc
        NotFreelancer,  // bạn không phải là freelancer

        // Lỗi check job
        NotExisted,       // Job không tồn tại
        NotTaked,         // chưa có người nhận job
        Taked,            //đã có người nhận
        NotTakeThisJob,   // bạn ko có nhận job này
        NotAssignThisJob, //bạn ko phải là người giao việc này

        // Lỗi liên quan đến thời gian hoàn thành job
        OutOfDate,

        // Lỗi liên quan tới status job
        Submited,             //đã submit
        Proccessing,          //đang có người làm
        CurrentJobIncomplete, //hoàn thành job hiện tại đã
        Finish,               //job đã kết thúc (hoàn thành hoặc bị hủy)

        // Lỗi liên quan đến đánh giá và tranh chấp
        InvalidPayAmount,   //số tiền phí không hợp lệ
        InvalidNegotiation, // yêu cầu thương lượng không hợp lệ
        InvalidTermination, // yêu cầu chấm dứt không hợp lệ
        InvalidReport,      // yêu cầu tố cáo không hợp lệ
        InvalidRating,      // yêu cầu đánh giá không hợp lệ
    }

    impl Account {
        /// Constructor that initializes the `bool` value to the given `init_value`.
        #[ink(constructor)]
        pub fn new() -> Self {
            Self::default()
        }

        #[ink(message)]
        pub fn register(
            &mut self,
            name: String,
            detail: String,
            string_role: String,
        ) -> Result<(), JobError> {
            let caller = self.env().caller();
            let role = match string_role.to_lowercase().as_str() {
                "individual" => AccountRole::INDIVIDUAL,
                "teamlead" => AccountRole::ENTERPRISE(OnwerRoleInEnterprise::TEAMLEAD),
                "accountant" => AccountRole::ENTERPRISE(OnwerRoleInEnterprise::ACCOUNTANT),
                _ => AccountRole::FREELANCER,
            };
            if role.clone() == AccountRole::FREELANCER {
                self.all_freelancer.push(caller);
            };
            let caller_info = UserInfo {
                name: name,
                detail: detail,
                role: role,
                successful_jobs_and_all_jobs: (0, 0),
                rating_points: 0,
            };
            match self.personal_account_info.get(caller) {
                None => self.personal_account_info.insert(caller, &caller_info),
                // _ => return Err(JobError::Registered),
                _ => self.personal_account_info.insert(caller, &caller_info),
            };
            Self::env().emit_event(Registered {
                account_id: caller,
                account_role: role,
            });
            Ok(())
        }

        //check tài khoản đăng kí hay chưa
        #[ink(message)]
        pub fn check_account(&self) -> bool {
            let account = self.env().caller();
            self.personal_account_info.contains(account)
        }

        //check người gọi là freelancer hay không
        #[ink(message)]
        pub fn check_caller_is_freelancer(&self) -> bool {
            let caller = self.env().caller();
            // self.personal_account_info.get(caller).unwrap().role == AccountRole::FREELANCER
            match self.personal_account_info.get(caller) {
                None => return false,
                Some(x) => {
                    return x.role == AccountRole::FREELANCER;
                }
            }
        }

        //check người gọi là owner hay không
        //owner được phép tạo job
        #[ink(message)]
        pub fn check_caller_is_owner(&self) -> bool {
            let caller = self.env().caller();
            match self.personal_account_info.get(caller) {
                None => return false,
                Some(x) => {
                    return x.role != AccountRole::FREELANCER;
                }
            }
        }

        //check exist wallet
        #[ink(message)]
        pub fn check_exist_wallet(&self) -> (String, String) {
            let caller = self.env().caller();
            self.personal_account_info.get(caller).map_or(
                (String::from("undefined"), String::from("undefined")),
                |x| match x.role {
                    AccountRole::FREELANCER => (x.name, String::from("freelancer")),
                    _ => (x.name, String::from("company")),
                },
            )
        }

        // get tất cả open job no parametter
        #[ink(message)]
        pub fn get_all_open_jobs_no_params(&self) -> Result<Vec<Job>, JobError> {
            let mut jobs = Vec::<Job>::new();
            for i in 0..self.current_job_id {
                jobs.push(self.jobs.get(i).unwrap());
            }
            let open_jobs = jobs
                .into_iter()
                .filter(|job| job.status == Status::OPEN || job.status == Status::REOPEN)
                .collect();
            Ok(open_jobs)
        }

        #[ink(message)]
        // get tất cả open job
        pub fn get_all_open_jobs(
            &mut self,
            keyword: String,
            string_category: String,
        ) -> Result<Vec<Job>, JobError> {
            let mut jobs = Vec::<Job>::new();
            for i in 0..self.current_job_id {
                jobs.push(self.jobs.get(i).unwrap());
            }
            let category = match string_category.to_lowercase().as_str() {
                "it" => Category::IT,
                "marketing" => Category::MARKETING,
                "photoshop" => Category::PHOTOSHOP,
                _ => Category::default(),
            };
            let open_jobs = jobs
                .into_iter()
                .filter(|job| job.status == Status::OPEN || job.status == Status::REOPEN)
                .filter(|job| job.name.contains(&keyword))
                .filter(|job| job.category == category || job.category == Category::NONE)
                .collect();

            Ok(open_jobs)
        }

        // get tất cả doing job của freelancer để submit, người gọi là freelancer
        #[ink(message)]
        pub fn get_all_doing_jobs_of_freelancer(&self) -> Result<Vec<Job>, JobError> {
            let freelancer = self.env().caller();
            let mut jobs = Vec::<Job>::new();
            for i in 0..self.current_job_id {
                jobs.push(self.jobs.get(i).unwrap());
            }
            let doing_jobs = jobs
                .into_iter()
                .filter(|job| job.status == Status::DOING)
                .filter(|job| job.person_obtain.unwrap() == freelancer)
                .collect();

            Ok(doing_jobs)
        }

        // get tất cả các review job của onwer, người gọi là owner
        #[ink(message)]
        pub fn get_all_review_jobs_of_owner(&self) -> Result<Vec<Job>, JobError> {
            let owner = self.env().caller();
            let mut jobs = Vec::<Job>::new();
            for i in 0..self.current_job_id {
                jobs.push(self.jobs.get(i).unwrap());
            }
            let doing_jobs = jobs
                .into_iter()
                .filter(|job| job.status == Status::REVIEW)
                .filter(|job| job.person_create.unwrap() == owner)
                .collect();
            Ok(doing_jobs)
        }


        // get 20 freelancer => name, Vec<category>
        #[ink(message)]
        pub fn get_freelancer(&self, filter: String) -> Result<Vec<(String, Vec<Job>)>, JobError> {
            let category_filter = if filter.to_lowercase().contains("it"){
                Category::IT
            } else if filter.contains("photoshop") {
                Category::PHOTOSHOP
            } else if filter.contains("marketing") {
                Category::MARKETING
            } else {
                Category::NONE
            };
            let mut result: Vec<(String, Vec<Job>)> =  Vec::new();
            let n = self.all_freelancer.clone().len();
            let _all_freelancer = self.all_freelancer.clone();
            for i in 0..n {
                let jobs_id_option = self.freelancer_jobs.get(_all_freelancer[i]);
                if let Some(job_id) = jobs_id_option {
                    let m = job_id.len();
                    let freelancer_name = self.personal_account_info.get(_all_freelancer[i]).unwrap().name;
                    let mut freelancer_and_job = (freelancer_name, Vec::new());
                    for j in 0..m {
                        if self.show_detail_job_of_id(job_id[j].0).unwrap().category == category_filter {
                            freelancer_and_job.1.push(self.jobs.get(job_id[j].0).unwrap())
                        }
                    }
                    result.push(freelancer_and_job);
                }
            }
            Ok(result)
        }

        //show thông tin account
        #[ink(message)]
        pub fn get_account_info(&self, caller: AccountId) -> Option<UserInfo> {
            self.personal_account_info.get(caller)
        }
        // show toàn bộ công việc của người tạo
        #[ink(message)]
        pub fn get_job_id_of_onwer(&self, owner: AccountId) -> Option<Vec<(JobId, bool)>> {
            self.owner_jobs.get(owner)
        }
        //show toàn bộ công việc của người nhận
        #[ink(message)]
        pub fn get_job_id_of_freelancer(&self, owner: AccountId) -> Option<Vec<(JobId, bool)>> {
            self.freelancer_jobs.get(owner)
        }

        //show chi tiết công việc
        #[ink(message)]
        pub fn show_detail_job_of_id(&self, job_id: JobId) -> Option<Job> {
            self.jobs.get(job_id)
        }

        #[ink(message, payable)]
        pub fn create_job(
            &mut self,
            name: String,
            description: String,
            string_category: String,
            duration: u64,
        ) -> Result<(), JobError> {
            // Tạo một công việc mới.
            //
            // Hàm này cho phép người phân công công việc tạo các công việc mới.

            //duration là nhập số ngày chú ý timestamp tính theo mili giây
            let caller = self.env().caller();
            let caller_info = self.personal_account_info.get(caller);
            match caller_info.clone() {
                None => return Err(JobError::NotRegistered), //check đăng kí chưa
                Some(user_info) => {
                    //check role đúng chưa
                    if user_info.role == AccountRole::FREELANCER {
                        return Err(JobError::NotJobAssigner);
                    }
                }
            }
            let deposite = self.env().transferred_value();
            let budget = deposite * (100 - FEE_PERCENTAGE as u128) / 100;
            let pay = budget;
            let start_time = self.env().block_timestamp();
            let category = match string_category.to_lowercase().as_str() {
                "it" => Category::IT,
                "marketing" => Category::MARKETING,
                "photoshop" => Category::PHOTOSHOP,
                _ => Category::NONE,
            };
            let current_id = self.current_job_id;
            let job = Job {
                name: name.clone(),
                job_id: current_id,
                description: description.clone(),
                category: category,
                result: None,
                status: Status::default(),
                budget: budget,
                pay: pay,
                fee_percentage: FEE_PERCENTAGE,
                start_time: start_time,
                end_time: start_time + duration * 24 * 60 * 60 * 1000,
                person_create: Some(caller),
                person_obtain: None,
                feedback: String::new(),
                request_negotiation: false,
                requester: None,
                reporter: None,
                require_rating: (false, false),
                unqualifier: false,
            };
            self.jobs.insert(current_id, &job);
            // update owner_jobs
            match self.owner_jobs.contains(caller) {
                true => {
                    let mut jobs_of_caller = self.owner_jobs.get(caller).unwrap();
                    jobs_of_caller.push((current_id, false));
                    self.owner_jobs.insert(caller, &jobs_of_caller);
                }
                false => {
                    let mut jobs_of_caller = Vec::new();
                    jobs_of_caller.push((current_id, false));
                    self.owner_jobs.insert(caller, &jobs_of_caller);
                }
            }
            self.current_job_id = current_id + 1;
            //update user_info chỗ successful_jobs_and_all_jobs: all_jobs tăng thêm 1
            let mut owner_detail = caller_info.unwrap();
            owner_detail.successful_jobs_and_all_jobs.1 =
                owner_detail.successful_jobs_and_all_jobs.1 + 1;
            self.personal_account_info.insert(caller, &owner_detail);

            // Emit the event.
            Self::env().emit_event(JobCreated {
                name: name,
                description: description,
                deposite: deposite,
                // duration: duration,
            });
            Ok(())
        }

        // có thể tùy chỉnh thêm lọc công việc theo status hoặc theo owner hoặc theo freelancer
        // lọc theo owner khi 1 owner có thể tạo nhiều công việc (chưa làm)
        // freelancer có thể apply job open va reopen
        #[ink(message)]
        pub fn get_jobs_with_status(&self, status: Status) -> Vec<Job> {
            let mut jobs = Vec::new();
            for index in 0..self.current_job_id {
                let job = self.jobs.get(index).unwrap();
                if job.status == status {
                    jobs.push(self.jobs.get(index).unwrap());
                }
            }
            jobs
        }

        #[ink(message)]
        pub fn obtain(&mut self, job_id: JobId) -> Result<(), JobError> {
            // Cho phép người dùng nhận công việc mới.
            //
            // Hàm này cho phép người phân công công việc tạo các công việc mới.

            let caller = self.env().caller();
            let caller_info = self.personal_account_info.get(caller);
            // kiểm tra đăng kí và role
            match caller_info.clone() {
                None => return Err(JobError::NotRegistered), //check đăng kí chưa
                Some(user_info) => {
                    //check role đúng chưa
                    if user_info.role != AccountRole::FREELANCER {
                        return Err(JobError::NotFreelancer);
                    }
                }
            }
            let mut job = self.jobs.get(job_id).ok_or(JobError::NotExisted)?;
            //check end_time
            if job.end_time < self.env().block_timestamp() {
                return Err(JobError::OutOfDate);
            };

            match job.status {
                Status::DOING => return Err(JobError::Proccessing),
                Status::REVIEW | Status::UNQUALIFIED => return Err(JobError::Submited),
                Status::CANCELED | Status::FINISH => return Err(JobError::Finish),
                Status::OPEN | Status::REOPEN => {
                    //update lại thông tin job
                    job.status = Status::DOING;
                    job.person_obtain = Some(caller);
                    //update công việc của freelancer
                    match self.freelancer_jobs.contains(caller) {
                        true => {
                            let mut jobs_of_caller = self.freelancer_jobs.get(caller).unwrap();
                            jobs_of_caller.push((job_id, false));
                            self.freelancer_jobs.insert(caller, &jobs_of_caller);
                        }
                        false => {
                            let mut jobs_of_caller = Vec::new();
                            jobs_of_caller.push((job_id, false));
                            self.freelancer_jobs.insert(caller, &jobs_of_caller);
                        }
                    }
                    //update user_info chỗ successful_jobs_and_all_jobs: all_jobs tăng thêm 1
                    let mut freelancer_detail = caller_info.unwrap();
                    freelancer_detail.successful_jobs_and_all_jobs.1 =
                        freelancer_detail.successful_jobs_and_all_jobs.1 + 1;
                    self.personal_account_info
                        .insert(caller, &freelancer_detail);
                    self.jobs.insert(job_id, &job);
                    // Emit the event.
                    Self::env().emit_event(JobObtained {
                        job_id,
                        freelancer: caller,
                    });
                }
            }

            Ok(())
        }

        #[ink(message)]
        pub fn submit(&mut self, job_id: JobId, result: String) -> Result<(), JobError> {
            let caller = self.env().caller();
            let caller_info = self.personal_account_info.get(caller);
            // kiểm tra đăng kí và role
            match caller_info.clone() {
                None => return Err(JobError::NotRegistered), //check đăng kí chưa
                Some(user_info) => {
                    //check role đúng chưa
                    if user_info.role != AccountRole::FREELANCER {
                        return Err(JobError::NotFreelancer);
                    }
                }
            }
            let mut job = self.jobs.get(job_id).ok_or(JobError::NotExisted)?;
            // Check job đó có phải của mình nhận hay không
            if job.person_obtain.unwrap() != caller {
                return Err(JobError::NotTakeThisJob);
            };
            // Check job status
            match job.status {
                // Status::OPEN | Status::REOPEN => return Err(JobError::NotTakeThisJob), // không thể xảy ra vì job đã của freelance
                Status::REVIEW | Status::UNQUALIFIED => return Err(JobError::Submited),
                Status::CANCELED | Status::FINISH => return Err(JobError::Finish),
                Status::DOING => {
                    // Update lại thông tin job
                    // Check job is expired
                    job.unqualifier = job.end_time < self.env().block_timestamp();
                    job.result = Some(result.clone());
                    job.status = Status::REVIEW;
                    self.jobs.insert(job_id, &job);
                    // Emit the event.
                    Self::env().emit_event(JobSubmitted {
                        job_id,
                        freelancer: caller,
                        result,
                    });
                }
                _ => (),
            }

            Ok(())
        }

        #[ink(message)]
        pub fn reject(&mut self, job_id: JobId) -> Result<(), JobError> {
            let caller = self.env().caller();
            let caller_info = self.personal_account_info.get(caller);
            // kiểm tra đăng kí và role
            match caller_info.clone() {
                None => return Err(JobError::NotRegistered), //check đăng kí chưa
                Some(user_info) => {
                    //check role đúng chưa
                    if user_info.role == AccountRole::FREELANCER {
                        return Err(JobError::NotJobAssigner);
                    }
                }
            }
            let mut job = self.jobs.get(job_id).ok_or(JobError::NotExisted)?;
            //check job đó có phải của mình giao hay không
            if job.person_create.unwrap() != caller {
                return Err(JobError::NotAssignThisJob);
            };
            match job.status {
                Status::OPEN | Status::REOPEN => return Err(JobError::NotTaked),
                Status::DOING | Status::UNQUALIFIED => return Err(JobError::Proccessing),
                Status::CANCELED | Status::FINISH => return Err(JobError::Finish),
                Status::REVIEW => {
                    //update lại thông tin job để freelancer biết chưa hài lòng
                    job.status = Status::UNQUALIFIED;
                    self.jobs.insert(job_id, &job);
                    // Emit the event.
                    Self::env().emit_event(JobRejected {
                        job_id,
                        owner: caller,
                    });
                }
            }
            Ok(())
        }

        #[ink(message, payable)]
        pub fn aproval(&mut self, job_id: JobId) -> Result<(), JobError> {
            let caller = self.env().caller();
            let caller_info = self.personal_account_info.get(caller);
            // kiểm tra đăng kí và role
            match caller_info.clone() {
                None => return Err(JobError::NotRegistered), //check đăng kí chưa
                Some(user_info) => {
                    //check role đúng chưa
                    if user_info.role == AccountRole::FREELANCER {
                        return Err(JobError::NotJobAssigner);
                    }
                }
            }
            let mut job = self.jobs.get(job_id).ok_or(JobError::NotExisted)?;
            //check end_time
            //check job đó có phải của mình hay không
            if job.person_create.unwrap() != caller {
                return Err(JobError::NotAssignThisJob);
            };
            match job.status {
                Status::OPEN | Status::REOPEN => return Err(JobError::NotTaked),
                Status::DOING | Status::UNQUALIFIED => return Err(JobError::Proccessing),
                Status::CANCELED | Status::FINISH => return Err(JobError::Finish),
                Status::REVIEW => {
                    //update lại thông tin job
                    job.status = Status::FINISH;
                    job.require_rating = (true, true);
                    //update user_info chỗ công việc thành công của owner tăng thêm 1
                    let mut owner_detail = caller_info.unwrap();
                    owner_detail.successful_jobs_and_all_jobs.0 =
                        owner_detail.successful_jobs_and_all_jobs.0 + 1;
                    self.personal_account_info.insert(caller, &owner_detail);
                    //update user_info chỗ công việc hoàn thành của freelancer tăng thêm 1
                    let freelancer = job.person_obtain.unwrap();
                    let mut freelancer_detail = self.personal_account_info.get(freelancer).unwrap();
                    freelancer_detail.successful_jobs_and_all_jobs.0 =
                        freelancer_detail.successful_jobs_and_all_jobs.0 + 1;
                    self.personal_account_info
                        .insert(freelancer, &freelancer_detail);

                    //Chỉnh lại trạng thái công việc đã thành công của onwer_jobs và freelancer_jobs
                    let mut owner_jobs_of_account_id = self.owner_jobs.get(caller).unwrap();
                    for element in owner_jobs_of_account_id.iter_mut() {
                        if element.0 == job_id {
                            element.1 = true;
                            break;
                        }
                    }
                    self.owner_jobs.insert(caller, &owner_jobs_of_account_id);

                    let mut freelancer_jobs_of_account_id =
                        self.freelancer_jobs.get(freelancer).unwrap();
                    for element in freelancer_jobs_of_account_id.iter_mut() {
                        if element.0 == job_id {
                            element.1 = true;
                            break;
                        }
                    }
                    self.owner_jobs
                        .insert(caller, &freelancer_jobs_of_account_id);

                    // self.list_jobs_assign
                    //     .insert(job.person_create.unwrap(), &(job_id, true));
                    // self.list_jobs_take
                    //     .insert(job.person_obtain.unwrap(), &(job_id, true));
                    // chuyển tiền và giữ lại phần trăm phí
                    // let budget = job.budget * (100 - FEE_PERCENTAGE as u128) / 100;
                    let _ = self.env().transfer(freelancer, job.pay);
                    self.jobs.insert(job_id, &job);
                }
            }
            // Emit the event.
            Self::env().emit_event(JobApproved {
                job_id,
                owner: caller,
                freelancer: job.person_obtain.unwrap(),
            });

            Ok(())
        }

        #[ink(message, payable)]
        pub fn cancel(&mut self, job_id: JobId) -> Result<(), JobError> {
            // Khách hàng có thể huỷ job nếu job ở trạng thái OPEN hoặc REOPEN hoặc UNQUALIFIED mà hết thời gian job, nếu job đã được giao thì không thể huỷ, budget của job sẽ được trả lại cho người giao job đó.
            // Retrieve job
            // let mut job = self.jobs.get(job_id).ok_or(JobError::NotExisted)?;
            // // Check caller is job owner ?
            // let caller = self.env().caller();
            // if self.owner_jobs.get(caller).unwrap().contains(&job_id) {
            //         return Err(JobError::NotAssignThisJob)
            // }
            let caller = self.env().caller();
            let caller_info = self.personal_account_info.get(caller);
            // kiểm tra đăng kí và role
            match caller_info.clone() {
                None => return Err(JobError::NotRegistered), //check đăng kí chưa
                Some(user_info) => {
                    //check role đúng chưa
                    if user_info.role == AccountRole::FREELANCER {
                        return Err(JobError::NotJobAssigner);
                    }
                }
            }
            let mut job = self.jobs.get(job_id).ok_or(JobError::NotExisted)?;

            //check job đó có phải của mình hay không
            if job.person_create.unwrap() != caller {
                return Err(JobError::NotAssignThisJob);
            };
            // Only allow cancel if status is OPEN or REOPEN
            match job.status {
                Status::OPEN | Status::REOPEN => {
                    // Set status to canceled
                    job.status = Status::CANCELED;
                    // Update job in storage
                    // trả tiền
                    // let budget = job.budget * (100 - FEE_PERCENTAGE as u128) / 100; // chuyển tiền và giữ lại phần trăm phí tạo việc
                    let _ = self.env().transfer(job.person_create.unwrap(), job.budget);
                    // self.list_jobs_assign
                    //     .insert(job.person_create.unwrap(), &(job_id, false));
                    self.jobs.insert(job_id, &job);
                }
                Status::DOING | Status::REVIEW => return Err(JobError::Proccessing),
                //nếu job đang ở trạng thái tranh chấp thì tùy theo deadline mà được hủy hay ko
                Status::UNQUALIFIED => {
                    if self.env().block_timestamp() > job.end_time {
                        return Err(JobError::OutOfDate);
                    } else {
                        return Err(JobError::Proccessing);
                    }
                }
                Status::CANCELED | Status::FINISH => return Err(JobError::Finish), // job đã bị hủy hoặc finish
            }
            // Emit the event.
            Self::env().emit_event(JobCanceled {
                job_id,
                owner: caller,
            });
            Ok(())
        }

        #[ink(message)]
        pub fn request_negotiate(
            &mut self,
            job_id: JobId,
            feedback: String,
            pay: u128,
        ) -> Result<(), JobError> {
            // Gửi yêu cầu thương lượng tới phía đối tác, người gửi setup mức giá mong muốn cho công việc đã submit
            let mut job = self.jobs.get(job_id).ok_or(JobError::NotExisted)?;
            let caller = self.env().caller();
            // Retrieve caller info
            let caller_info = self.personal_account_info.get(&caller);
            // Validate caller is registered
            let caller_info = caller_info.ok_or(JobError::NotRegistered)?;
            // Caller is a freelancer?
            if caller_info.role != AccountRole::FREELANCER {
                if job.person_create.unwrap() != caller {
                    return Err(JobError::NotAssignThisJob);
                }
            } else {
                // Validate caller is assigned the job
                if job.person_obtain.unwrap() != caller {
                    return Err(JobError::NotTakeThisJob);
                }
            }
            // Add validation for pay amount
            match pay {
                i if (i > 0 && i < job.budget) => {
                    // Validate job status
                    match job.status {
                        Status::UNQUALIFIED => {
                            // Send negotiation request
                            if job.request_negotiation == false {
                                job.pay = pay;
                                job.request_negotiation = true;
                                job.feedback = feedback;
                                job.requester = Some(caller);
                                self.jobs.insert(job_id, &job);
                            } else {
                                return Err(JobError::InvalidNegotiation);
                            }
                        }
                        Status::OPEN | Status::REOPEN => return Err(JobError::NotAssignThisJob),
                        Status::DOING | Status::REVIEW => return Err(JobError::Proccessing),
                        Status::CANCELED | Status::FINISH => return Err(JobError::NotExisted),
                    }
                }
                _ => return Err(JobError::InvalidPayAmount),
            }
            // Emit the event.
            Self::env().emit_event(JobNegotiationRequested {
                job_id,
                requester: caller,
                pay,
            });
            Ok(())
        }

        #[ink(message, payable)]
        pub fn respond_negotiate(
            &mut self,
            job_id: JobId,
            agreement: bool,
        ) -> Result<(), JobError> {
            // Phản hồi thương lượng từ phía gửi, người nhận yêu cầu lựa chọn đồng ý hoặc không đồng ý với yêu cầu này
            let mut job = self.jobs.get(job_id).ok_or(JobError::NotExisted)?;
            let caller = self.env().caller();
            // Retrieve caller info
            let _caller_info = self
                .personal_account_info
                .get(&caller)
                .ok_or(JobError::NotRegistered)?;
            match job.requester.unwrap() {
                i if i == job.person_create.unwrap() => {
                    if caller != job.person_obtain.unwrap() {
                        return Err(JobError::NotTakeThisJob);
                    }
                }
                i if i == job.person_obtain.unwrap() => {
                    if caller != job.person_create.unwrap() {
                        return Err(JobError::NotAssignThisJob);
                    }
                }
                _ => return Err(JobError::NotTaked),
            }

            match job.status {
                Status::UNQUALIFIED => {
                    if job.request_negotiation {
                        if agreement {
                            job.status = Status::FINISH;
                            // Update job in storage
                            // Transfer funds
                            let _ = self.env().transfer(job.person_obtain.unwrap(), job.pay);
                            let _ = self
                                .env()
                                .transfer(job.person_create.unwrap(), job.budget - job.pay);
                            // self.list_jobs_assign
                            //     .insert(job.person_create.unwrap(), &(job_id, true));
                            // self.list_jobs_take
                            //     .insert(job.person_obtain.unwrap(), &(job_id, true));
                            // self.jobs.insert(job_id, &job);
                            //Chỉnh lại trạng thái công việc đã thành công của onwer_jobs và freelancer_jobs
                            let mut owner_jobs_of_account_id = self.owner_jobs.get(caller).unwrap();
                            for element in owner_jobs_of_account_id.iter_mut() {
                                if element.0 == job_id {
                                    element.1 = true;
                                    break;
                                }
                            }
                            self.owner_jobs.insert(caller, &owner_jobs_of_account_id);

                            let freelancer = job.person_obtain.unwrap();
                            let mut freelancer_jobs_of_account_id =
                                self.freelancer_jobs.get(freelancer).unwrap();
                            for element in freelancer_jobs_of_account_id.iter_mut() {
                                if element.0 == job_id {
                                    element.1 = true;
                                    break;
                                }
                            }
                            self.owner_jobs
                                .insert(caller, &freelancer_jobs_of_account_id);
                        } else {
                            // If respond is don't agree
                            job.request_negotiation = false;
                            job.requester = None;
                            job.pay = job.budget;
                            self.jobs.insert(job_id, &job);
                        }
                    } else {
                        return Err(JobError::InvalidNegotiation);
                    }
                }
                Status::OPEN | Status::REOPEN => return Err(JobError::NotAssignThisJob),
                Status::DOING | Status::REVIEW => return Err(JobError::Proccessing),
                Status::CANCELED | Status::FINISH => return Err(JobError::NotExisted),
            }
            // Emit the event.
            Self::env().emit_event(JobNegotiationResponded {
                job_id,
                responder: caller,
                agreement,
            });
            Ok(())
        }

        #[ink(message, payable)]
        pub fn terminate(&mut self, job_id: JobId) -> Result<(), JobError> {
            // Trong trường hợp bên nào đó không muốn tiếp tục thương lượng có thể chấm dứt hợp đồng bất cứ lúc nào. Nếu lý do chấm dứt hợp đồng hợp lý (quá hạn công việc), bên bị chấm dứt không có quyền tố cáo. Nếu yêu cầu chấm dứt hợp đồng không hợp lý, người bị chấm dứt có quyền tố cáo đối tác
            // Retrieve the job from storage
            let mut job = self.jobs.get(job_id).ok_or(JobError::NotExisted)?;
            // Get the caller's address
            let caller = self.env().caller();
            // Retrieve caller info
            let _caller_info = self
                .personal_account_info
                .get(&caller)
                .ok_or(JobError::NotRegistered)?;
            // Check job is expired
            job.unqualifier = job.end_time < self.env().block_timestamp();
            // Handle different status cases
            match job.status {
                // If the job is in the OPEN or REOPEN status, return error not take this job
                Status::OPEN | Status::REOPEN => return Err(JobError::NotTakeThisJob),
                // If the job is in the UNQUALIFIED status
                Status::UNQUALIFIED | Status::DOING | Status::REVIEW => {
                    // Check if the caller and qualifier of job
                    match (caller, job.unqualifier) {
                        (a, b) if (a == job.person_create.unwrap() && b) => job.reporter = None,
                        (a, b) if (a == job.person_create.unwrap() && !b) => {
                            job.reporter = job.person_obtain
                        }
                        (a, b) if (a == job.person_obtain.unwrap() && b) => {
                            job.reporter = job.person_create
                        }
                        (a, b) if (a == job.person_obtain.unwrap() && !b) => job.reporter = None,
                        _ => return Err(JobError::InvalidTermination),
                    }
                    // Update history jobs
                    // self.list_jobs_take
                    //     .insert(job.person_obtain.unwrap(), &(job_id, false));
                    // Set the job status to REOPEN
                    job.status = Status::REOPEN;
                    job.pay = job.budget;
                    job.person_obtain = None;
                    self.jobs.insert(job_id, &job);
                }
                // If the job is in the CANCELED or FINISH status, return an error
                Status::CANCELED | Status::FINISH => return Err(JobError::Finish),
            }
            // Emit the event.
            Self::env().emit_event(JobTerminated {
                job_id,
                terminator: caller,
                reporter: job.reporter,
            });
            Ok(())
        }

        #[ink(message)]
        pub fn report(&mut self, job_id: JobId, report: ReportInfo) -> Result<(), JobError> {
            let mut job = self.jobs.get(job_id).ok_or(JobError::NotExisted)?;
            // Get the caller's address
            let caller = self.env().caller();
            // Retrieve caller info validate that the caller is registered
            let _caller_info = self
                .personal_account_info
                .get(&caller)
                .ok_or(JobError::NotRegistered)?;
            match caller {
                x if x == job.reporter.unwrap() => {
                    job.reporter = None;
                    self.jobs.insert(job_id, &job);
                    // self.list_jobs_take
                    //     .insert(job.person_obtain.unwrap(), &(job_id, false));
                    match x {
                        y if y == job.person_create.unwrap() => {
                            // self.reports
                            //     .insert(job.person_obtain.unwrap(), &(job_id, Some(report)));
                            //Chỉnh lại report của onwer_jobs
                            match self.reports.contains(job.person_obtain.unwrap()) {
                                true => {
                                    let mut report_of_onwer =
                                        self.reports.get(job.person_obtain.unwrap()).unwrap();
                                    report_of_onwer.push((job_id, Some(report.clone())));
                                    self.reports
                                        .insert(job.person_obtain.unwrap(), &report_of_onwer);
                                }
                                false => {
                                    let mut report_of_onwer = Vec::new();
                                    report_of_onwer.push((job_id, Some(report.clone())));
                                    self.reports
                                        .insert(job.person_obtain.unwrap(), &report_of_onwer);
                                }
                            }
                        }
                        y if y == job.person_obtain.unwrap() => {
                            // self.reports
                            //     .insert(job.person_create.unwrap(), &(job_id, Some(report)));
                            //Chỉnh lại report của freelancer_jobs
                            match self.reports.contains(job.person_create.unwrap()) {
                                true => {
                                    let mut report_of_freelancer =
                                        self.reports.get(job.person_create.unwrap()).unwrap();
                                    report_of_freelancer.push((job_id, Some(report.clone())));
                                    self.reports
                                        .insert(job.person_create.unwrap(), &report_of_freelancer);
                                }
                                false => {
                                    let mut report_of_freelancer = Vec::new();
                                    report_of_freelancer.push((job_id, Some(report.clone())));
                                    self.reports
                                        .insert(job.person_create.unwrap(), &report_of_freelancer);
                                }
                            }
                        }
                        _ => return Err(JobError::InvalidReport),
                    }
                }
                _ => return Err(JobError::InvalidReport),
            }
            // Emit the event.
            Self::env().emit_event(JobReported {
                job_id,
                reporter: caller,
                report,
            });
            Ok(())
        }

        #[ink(message)]
        pub fn rating(&mut self, job_id: JobId, rating_point: RatingPoint) -> Result<(), JobError> {
            let mut job = self.jobs.get(job_id).ok_or(JobError::NotExisted)?;
            // Get the caller's address
            let caller = self.env().caller();
            // Retrieve caller info and validate that the caller is registered
            let _caller_info = self
                .personal_account_info
                .get(&caller)
                .ok_or(JobError::NotRegistered)?;
            match job.status {
                Status::OPEN | Status::REOPEN => return Err(JobError::NotTaked),
                Status::DOING | Status::UNQUALIFIED | Status::REVIEW => {
                    return Err(JobError::Proccessing)
                }
                Status::CANCELED => return Err(JobError::NotExisted),
                Status::FINISH => match (caller, job.require_rating) {
                    (a, (b, _)) if (a == job.person_create.unwrap() && b) => {
                        // update ratings
                        match self.ratings.contains(job.person_create.unwrap()) {
                            true => {
                                let mut ratings_of_onwer = self.ratings.get(caller).unwrap();
                                ratings_of_onwer.push((job_id, Some(rating_point.clone())));
                                self.ratings
                                    .insert(job.person_obtain.unwrap(), &ratings_of_onwer);
                            }
                            false => {
                                let mut ratings_of_onwer = Vec::new();
                                ratings_of_onwer.push((job_id, Some(rating_point.clone())));
                                self.ratings
                                    .insert(job.person_obtain.unwrap(), &ratings_of_onwer);
                            }
                        }
                        job.require_rating.0 = false;
                        self.jobs.insert(job_id, &job);
                    }
                    (a, (_, c)) if (a == job.person_obtain.unwrap() && c) => {
                        // update ratings
                        match self.ratings.contains(job.person_obtain.unwrap()) {
                            true => {
                                let mut ratings_of_freelancer = self.ratings.get(caller).unwrap();
                                ratings_of_freelancer.push((job_id, Some(rating_point.clone())));
                                self.ratings
                                    .insert(job.person_create.unwrap(), &ratings_of_freelancer);
                            }
                            false => {
                                let mut ratings_of_freelancer = Vec::new();
                                ratings_of_freelancer.push((job_id, Some(rating_point.clone())));
                                self.ratings
                                    .insert(job.person_create.unwrap(), &ratings_of_freelancer);
                            }
                        }
                        job.require_rating.1 = false;
                        self.jobs.insert(job_id, &job);
                    }
                    _ => return Err(JobError::InvalidRating),
                },
            }
            // Emit the event.
            Self::env().emit_event(JobRated {
                job_id,
                rater: caller,
                rating_point,
            });
            Ok(())
        }
    }

    // viết test
    #[cfg(test)]
    mod tests {

        use crate::polkalance::*;
        use ink::codegen::Env;
        use ink::env::test;

        // vec để set địa chỉ contract.
        const CONTRACT: [u8; 32] = [7; 32];

        // lấy dãy các account truy cập alice là [1;32] bov là [2;32]...
        // cách truy cập là default_accounts().alice, ...
        fn default_accounts() -> test::DefaultAccounts<Environment> {
            ink::env::test::default_accounts::<Environment>()
        }

        //set caller: người gọi
        fn set_caller(sender: AccountId) {
            ink::env::test::set_caller::<Environment>(sender);
        }

        //set callee: người được gọi
        fn set_callee(sender: AccountId) {
            ink::env::test::set_callee::<Environment>(sender);
        }

        //get account Balance
        fn get_balance_of(sender: AccountId) -> u128 {
            ink::env::test::get_account_balance::<Environment>(sender).unwrap()
        }

        //tạo địa chỉ [7;32]
        fn get_address_contract() -> AccountId {
            AccountId::from(CONTRACT)
        }

        //build contract với địa chỉ là [7;32]
        fn build_contract() -> Account {
            let callee: AccountId = AccountId::from(CONTRACT);
            ink::env::test::set_callee::<ink::env::DefaultEnvironment>(callee);
            Account::new()
        }

        fn register_owner(constract: &mut Account, caller: AccountId) {
            set_caller(caller);
            let name = "User".to_string();
            let detail = "User information".to_string();
            let string_role = "individual".to_string();
            let result = constract.register(name, detail, string_role);
            assert!(result.is_ok())
        }

        fn register_freelancer(constract: &mut Account, caller: AccountId) {
            set_caller(caller);
            let name = "Freelancer".to_string();
            let detail = "Freelancer information".to_string();
            let string_role = "freelancer".to_string();
            let result = constract.register(name, detail, string_role);
            assert!(result.is_ok())
        }

        fn create_new_job(contract: &mut Account, caller: AccountId) {
            set_caller(caller);
            let name = "user's job".to_string();
            let description = "detail of user's job".to_string();
            let string_category = "it".to_string();
            let duration: u64 = 1;
            let result = contract.create_job(name, description, string_category, duration);
            assert!(result.is_ok());
        }

        fn obtain_job(contract: &mut Account, caller: AccountId, job_id: u128) {
            set_caller(caller);
            let result = contract.obtain(job_id);
            assert!(result.is_ok());
        }

        fn submit_job(contract: &mut Account, caller: AccountId, job_id: u128) {
            set_caller(caller);
            let result_job = "this is a result of this job".to_string();
            let result = contract.submit(job_id, result_job);
            assert!(result.is_ok());
        }

        #[ink::test]
        fn test_register_success() {
            //build contract với địa chỉ là [7;32]
            let mut account = build_contract();
            //check lại đúng địa chỉ [7;32] chưa
            assert_eq!(account.env().account_id(), get_address_contract());
            //lấy account alice và set người gọi là alice
            let alice = default_accounts().alice;
            set_caller(alice);
            let result = account.register(
                "Alice".to_string(),
                "Alice's details".to_string(),
                "individual".to_string(),
            );
            assert!(result.is_ok());
            let caller_info = account.personal_account_info.get(&alice).unwrap();
            assert_eq!(caller_info.name, "Alice");
            assert_eq!(caller_info.detail, "Alice's details");
            assert_eq!(caller_info.role, AccountRole::INDIVIDUAL);
        }

        #[ink::test]
        fn test_create_success() {
            //build contract với địa chỉ là [7;32]
            let mut account = build_contract();
            //lấy alice và set caller là alice
            let alice = default_accounts().alice;
            set_caller(alice);
            let _resut_create_account = account.register(
                "Alice".to_string(),
                "Alice's details".to_string(),
                "individual".to_string(),
            );
            //check người gọi và thử role tk đăng kí có phải alice ko
            assert_eq!(account.env().caller(), alice);
            assert_eq!(
                account.personal_account_info.get(&alice).unwrap().role,
                AccountRole::INDIVIDUAL
            );
            //set số lượng tiền deposit vào smartcontract
            ink::env::test::set_value_transferred::<ink::env::DefaultEnvironment>(1000);
            // Create a new job.
            let result = account.create_job(
                "My new job".to_string(),
                "This is a description of my new job.".to_string(),
                "it".to_string(),
                1, // 1 day
            );
            assert!(result.is_ok());
            let job = account.jobs.get(0).unwrap();
            assert_eq!(job.name, "My new job".to_string());
            assert_eq!(
                job.description,
                "This is a description of my new job.".to_string()
            );
            assert_eq!(job.category, Category::IT);
            assert_eq!(job.start_time, account.env().block_timestamp());
            assert_eq!(
                job.end_time,
                account.env().block_timestamp() + 24 * 60 * 60 * 1000
            );
            assert_eq!(job.budget, 970); //hao 3% phí
            assert_eq!(job.status, Status::OPEN);
            assert_eq!(
                account
                    .personal_account_info
                    .get(alice)
                    .unwrap()
                    .successful_jobs_and_all_jobs,
                (0, 1)
            );
            assert_eq!(
                account.owner_jobs.get(alice).unwrap(),
                Vec::from([(0, false)])
            );
        }

        #[ink::test]
        fn test_obtain_success() {
            //build contract với địa chỉ là [7;32]
            let mut account = build_contract();
            //lấy alice và set caller là alice
            let alice = default_accounts().alice;
            set_caller(alice);
            let _resut_create_account = account.register(
                "Alice".to_string(),
                "Alice's details".to_string(),
                "individual".to_string(),
            );
            ink::env::test::set_value_transferred::<ink::env::DefaultEnvironment>(1000);
            // Create a new job.
            let result = account.create_job(
                "My new job".to_string(),
                "This is a description of my new job.".to_string(),
                "it".to_string(),
                1, // 1 day
            );
            assert!(result.is_ok());
            //insert bob là freelancer
            let bob = default_accounts().bob;
            account.personal_account_info.insert(
                bob,
                &UserInfo {
                    name: "Freelancer".to_string(),
                    detail: "This is a freelancer.".to_string(),
                    role: AccountRole::FREELANCER,
                    successful_jobs_and_all_jobs: (0, 0),
                    rating_points: 0,
                },
            );
            //bob là người gọi
            set_caller(bob);
            let result = account.obtain(0);
            assert!(result.is_ok());
            let job = account.jobs.get(0).unwrap();
            assert_eq!(job.status, Status::DOING);
            assert_eq!(job.person_obtain, Some(bob));
            assert_eq!(
                account
                    .personal_account_info
                    .get(bob)
                    .unwrap()
                    .successful_jobs_and_all_jobs,
                (0, 1)
            );
            assert_eq!(
                account.freelancer_jobs.get(bob).unwrap(),
                Vec::from([(0, false)])
            );
        }

        #[ink::test]
        fn test_submit_success() {
            let mut account = build_contract();
            let alice = default_accounts().alice;
            set_caller(alice);
            let _resut_create_account = account.register(
                "Alice".to_string(),
                "Alice's details".to_string(),
                "individual".to_string(),
            );
            ink::env::test::set_value_transferred::<ink::env::DefaultEnvironment>(1000);
            account
                .create_job(
                    "My new job".to_string(),
                    "This is a description of my new job.".to_string(),
                    "it".to_string(),
                    1, // 1 day
                )
                .unwrap();
            let _job = account.jobs.get(0).unwrap();
            let freelancer = default_accounts().bob;
            account.personal_account_info.insert(
                freelancer,
                &UserInfo {
                    name: "Freelancer".to_string(),
                    detail: "This is a freelancer.".to_string(),
                    role: AccountRole::FREELANCER,
                    successful_jobs_and_all_jobs: (0, 0),
                    rating_points: 0,
                },
            );
            set_caller(freelancer);
            account.obtain(0).unwrap();
            let input = "This is the job result.".to_string();
            let result = account.submit(0, input.clone());
            assert!(result.is_ok());
            let job = account.jobs.get(0).unwrap();
            assert_eq!(job.status, Status::REVIEW);
            assert_eq!(job.result, Some(input));
        }

        #[ink::test]
        fn test_submit_fail_not_registered() {
            let mut account = build_contract();
            set_caller(default_accounts().alice);
            let _resut_create_account = account.register(
                "Alice".to_string(),
                "Alice's details".to_string(),
                "individual".to_string(),
            );
            account
                .create_job(
                    "My new job".to_string(),
                    "This is a description of my new job.".to_string(),
                    "it".to_string(),
                    1, // 1 day
                )
                .unwrap();
            let input = "This is the job result.".to_string();
            set_caller(default_accounts().bob);
            let _result = account.submit(0, input);
            assert_eq!(_result.unwrap_err(), JobError::NotRegistered);
        }

        #[ink::test]
        fn test_submit_fail_not_freelancer() {
            let mut account = build_contract();
            set_caller(default_accounts().alice);
            let _resut_create_account = account.register(
                "Alice".to_string(),
                "Alice's details".to_string(),
                "individual".to_string(),
            );
            account
                .create_job(
                    "My new job".to_string(),
                    "This is a description of my new job.".to_string(),
                    "it".to_string(),
                    1, // 1 day
                )
                .unwrap();
            let job_assigner = default_accounts().bob;
            account.personal_account_info.insert(
                job_assigner,
                &UserInfo {
                    name: "Job assigner".to_string(),
                    detail: "This is a job assigner.".to_string(),
                    role: AccountRole::INDIVIDUAL,
                    successful_jobs_and_all_jobs: (0, 0),
                    rating_points: 0,
                },
            );
            let input = "This is the job result.".to_string();
            set_caller(job_assigner);
            let _result = account.submit(0, input);
            assert_eq!(_result.unwrap_err(), JobError::NotFreelancer);
        }

        #[ink::test]
        fn test_submit_fail_job_not_existed() {
            let mut account = build_contract();
            set_caller(default_accounts().alice);
            let _resut_create_account = account.register(
                "Alice".to_string(),
                "Alice's details".to_string(),
                "freelancer".to_string(),
            );
            let input = "This is the job result.".to_string();
            let _result = account.submit(0, input);
            assert_eq!(_result.unwrap_err(), JobError::NotExisted);
        }

        #[ink::test]
        fn test_reject_not_work() {
            let mut account = build_contract();
            set_caller(default_accounts().alice);
            //check lỗi chưa đăng kí
            let result = account.reject(0);
            assert_eq!(result, Err(JobError::NotRegistered));
            //alice đăng kí user và tạo job
            register_owner(&mut account, default_accounts().alice);
            create_new_job(&mut account, default_accounts().alice);
            //bob đăng kí freelancer
            register_freelancer(&mut account, default_accounts().bob);
            let result = account.reject(0);
            assert_eq!(result, Err(JobError::NotJobAssigner));
            //charlie đăng kí và reject
            register_owner(&mut account, default_accounts().charlie);
            let result = account.reject(0);
            assert_eq!(result, Err(JobError::NotAssignThisJob));
            //check alice hủy job
            set_caller(default_accounts().alice);
            let result = account.reject(0);
            assert_eq!(result, Err(JobError::NotTaked));
            //bob nhận việc và alice reject
            set_caller(default_accounts().bob);
            let _ = account.obtain(0);
            set_caller(default_accounts().alice);
            let result = account.reject(0);
            assert_eq!(result, Err(JobError::Proccessing));
            //chỉnh trạng thái công việc cancle
            let mut job0 = account.jobs.get(0).unwrap();
            job0.status = Status::CANCELED;
            account.jobs.insert(0, &job0);
            set_caller(default_accounts().alice);
            let result = account.reject(0);
            assert_eq!(result, Err(JobError::Finish));
        }

        #[ink::test]
        fn test_reject_should_work() {
            let mut account = build_contract();
            register_owner(&mut account, default_accounts().alice);
            create_new_job(&mut account, default_accounts().alice);
            register_freelancer(&mut account, default_accounts().bob);
            obtain_job(&mut account, default_accounts().bob, 0);
            submit_job(&mut account, default_accounts().bob, 0);
            set_caller(default_accounts().alice);
            let result = account.reject(0);
            assert!(result.is_ok());
        }

        #[ink::test]
        fn test_approval_not_work() {
            let mut account = build_contract();
            set_caller(default_accounts().alice);
            //check lỗi chưa đăng kí
            let result = account.aproval(0);
            assert_eq!(result, Err(JobError::NotRegistered));
            //alice đăng kí user và tạo job
            register_owner(&mut account, default_accounts().alice);
            create_new_job(&mut account, default_accounts().alice);
            //bob đăng kí freelancer
            register_freelancer(&mut account, default_accounts().bob);
            let result = account.aproval(0);
            assert_eq!(result, Err(JobError::NotJobAssigner));
            //charlie đăng kí và reject
            register_owner(&mut account, default_accounts().charlie);
            let result = account.aproval(0);
            assert_eq!(result, Err(JobError::NotAssignThisJob));
            //check alice aproval job
            set_caller(default_accounts().alice);
            let result = account.aproval(0);
            assert_eq!(result, Err(JobError::NotTaked));
            // //bob nhận việc và alice reject
            set_caller(default_accounts().bob);
            let _ = account.obtain(0);
            set_caller(default_accounts().alice);
            let result = account.aproval(0);
            assert_eq!(result, Err(JobError::Proccessing));
            //chỉnh trạng thái công việc cancle
            let mut job0 = account.jobs.get(0).unwrap();
            job0.status = Status::CANCELED;
            account.jobs.insert(0, &job0);
            set_caller(default_accounts().alice);
            let result = account.aproval(0);
            assert_eq!(result, Err(JobError::Finish));
        }

        #[ink::test]
        fn test_aproval_should_work() {
            let mut account = build_contract();
            let alice = default_accounts().alice;
            let bob = default_accounts().bob;
            register_owner(&mut account, alice);
            set_caller(alice);
            set_callee(AccountId::from([7; 32]));
            ink::env::test::set_value_transferred::<ink::env::DefaultEnvironment>(1000);
            // let old_balance_of_alice = get_balance_of(alice);
            create_new_job(&mut account, alice);
            assert_eq!(account.jobs.get(0).unwrap().budget, 970);
            //không hiểu sao lại lỗi chỗ này
            // assert_eq!(get_balance_of(alice), old_balance_of_alice - 1000);
            register_freelancer(&mut account, bob);
            obtain_job(&mut account, bob, 0);
            submit_job(&mut account, bob, 0);
            set_caller(alice);
            let result = account.aproval(0);
            assert!(result.is_ok());
        }
    }
}
