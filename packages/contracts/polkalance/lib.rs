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
    pub struct JobAuction {
        #[ink(topic)]
        job_id: JobId,
        #[ink(topic)]
        desired_salary: u128,
    }

    #[ink(event)]
    pub struct JobChooseTheBestBid {
        #[ink(topic)]
        job_id: JobId,
        #[ink(topic)]
        freelancer: AccountId,
    }

    #[ink(event)]
    pub struct CreateContract {
        #[ink(topic)]
        job_id: JobId,
        #[ink(topic)]
        onwer: AccountId,
        #[ink(topic)]
        freelancer: AccountId,
    }

    #[ink(event)]
    pub struct SignAndJobObtained {
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
        negotiation_pay: u128,
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
        owner_of_account: Option<AccountId>, //chủ sở hữu smart contract (người khởi tạo nên smart contract), lợi nhuận thu được sẽ được rút về account này (chưa làm msg chuyển  tiền)
        fee_balance: Balance,   //tổng tiền phí thu được
        jobs: Mapping<JobId, Job>, // map jobID đến job: luôn là trạng thái cuối cùng của job, như vậy job reopen sẽ ko lưu người làm trước, phần đó lưu trong unsuccessful_job kèm đánh giá
        current_job_id: JobId,
        personal_account_info: Mapping<AccountId, UserInfo>,
        owner_jobs: Mapping<AccountId, Vec<(JobId, Status)>>, //khi tạo job phải add thông tin vào, thay đổi khi create, approval, respond_negotiate thành công
        freelancer_jobs: Mapping<AccountId, Vec<(JobId, Status)>>, //khi nhận job phải add thông tin vào, thay đổi khi obtain, approval, respond_negotiate thành công
        all_freelancer: Vec<AccountId>,
        ratings: Mapping<AccountId, Vec<(JobId, Option<RatingPoint>)>>, // <JobId: id công việc, Điểm đánh giá>
        reports: Mapping<AccountId, Vec<(JobId, Option<ReportInfo>)>>, // <JobId: id công việc, Thông tin tố cáo>
        auction: Mapping<JobId, Vec<(AccountId, u128, u128)>>, //đấu giá công việc job_id => (người đấu giá, tiền mong muốn được trả của freelancer, tiền cọc mong muốn của công ty)
        contracts: Mapping<JobId, Contract>,
    }

    #[derive(scale::Decode, scale::Encode, Default, Debug, Clone, PartialEq)]
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
        pay: Balance,        // số tiền sẽ trả cho người làm chính là số tiền trong hợp đồng được kí kết
        negotiation_pay : Balance, //số tiền thương lượng khi công việc không được hoàn thành, số tiền này sẽ được chi trả nếu 2 bên thượng lượng thống nhất (nếu ko thống nhất trả theo phần trăm trong hợp đồng)
        feedback: String,    // phản hồi của đối tác
        request_negotiation: bool, // yêu cầu thương lượng
        requester: Option<AccountId>, // người yêu cầu thương lượng
        reporter: Option<AccountId>, // người được phép tố cáo
        require_rating: (bool, bool), // yêu cầu đánh giá của (người giao việc, người nhận việc)
        unqualifier: bool,   // smart contract phát hiện công việc không đạt chất lượng (quá hạn)
        required_deposit_of_owner: Balance, //onwer quy định khoản này và deposit vào, khi hoàn thành công việc, tiền sẽ được trả về.
        required_deposit_of_freelancer: Balance, //owner quy định khoản này. Khi freelancer ký hợp đồng thì thực hiện chuyển tiền vào smc, tiền được trả khi hoàn thành công việc.
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

    #[derive(scale::Decode, scale::Encode, Default, Debug, PartialEq, Clone)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub enum Status {
        #[default]
        OPEN,
        AUCTIONING, //đang đấu giá
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

    #[derive(scale::Decode, scale::Encode, Default, Debug, Clone, PartialEq)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub struct UserInfo {
        name: String,
        detail: String,    //liên kết đến IPFS lưu trữ thông tin cá nhân (tạm thời lưu giới thiệu ngắn gọn về bản thân)
        role: AccountRole, // vai trò
        successful_jobs_and_all_jobs: (u32, u32), //số lượng công việc thành công trên số lượng công việc đã tạo (client) hoặc đã nhận (freelancer).
        rating_points: (u32, u32),                //điểm dánh giá (tổng số điểm đánh giá, số người đánh giá) => số điểm đánh giá sẽ tính trên front end.
    }


    #[derive(scale::Decode, scale::Encode, Default, Debug, Clone, PartialEq)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub struct Contract {
        job_id: JobId,
        party_a: Option<AccountId>,
        party_a_consent: Option<bool>,
        party_b: Option<AccountId>,
        party_b_consent: Option<bool>,
        rules: String,
        percent_paid_when_contract_fail: u8,
        deadline_to_sign_contract: Timestamp,
    }

    #[derive(scale::Decode, scale::Encode, Debug, PartialEq)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum JobError {
        // Lỗi liên quan đến chủ sở hữu của smc và rút tiền từ smc
        NotOwnerOfThisContract,      //không phải chủ sở hữu của smc
        OverBalance,                 //vượt quá lượng tiền lời trong smc
        // Lỗi liên quan tới đăng kí tài khoản
        Registered,    //đã đăng kí tài khoản (đăng kí), không đăng kí nữa
        NotRegistered, // chưa đăng kí tài khoản.

        // Lỗi role
        NotJobAssigner,     // bạn không phải là người giao việc
        NotFreelancer,      // bạn không phải là freelancer

        //lỗi liên quan đến đấu giá job
        InvalidBid,         //đấu giá không hợp lệ (lương yêu cầu lớn hơn pay)
        InvalidBidder,      //người đấu giá không hợp lệ
        NoBidder,           //không có người đấu giá job
        NotBidder,          //không phải người đấu giá

        //lỗi liên quan đến contract
        NotExistedThisContract,             //hơp đồng không tồn tại
        NotPartyA,                          //không phải là bên A trong hợp đồng
        NotPartyB,                          //không phải là bên B trong hợp đồng
        Signed,                             //đã kí hợp đồng
        CreatedContract,                    //đã tạo hợp đồng với job này
        ConfirmationTimeExpires,            // quá thời gian để ký hợp đồng
        ConfirmationTimeNotExpires,         // chưa quá thời gian để ký hợp đồng
        InvalidDeposit,                     //số tiền đặt cọc không hợp lệ

        // Lỗi check job
        NotExisted,       // Job không tồn tại
        NotTaked,         // chưa có người nhận job
        Taked,            //đã có người nhận
        NotTakeThisJob,   // bạn ko có nhận job này
        NotAssignThisJob, //bạn ko phải là người giao việc này

        // Lỗi liên quan đến thời gian hoàn thành job (thời gian từ lúc tạo job cho đến khi kết thúc và trả tiền cho freelancer)
        OutOfDate,

        // Lỗi liên quan tới status job
        Submitted,             //đã submit
        Processing,          //đang có người làm
        Finished,             //job đã kết thúc
        Canceled,            //job đã bị hủy

        // Lỗi liên quan đến đánh giá và tranh chấp
        InvalidPayAmount,   //số tiền phí không hợp lệ
        InvalidNegotiation, // yêu cầu thương lượng không hợp lệ
        InvalidTermination, // yêu cầu chấm dứt không hợp lệ
        InvalidReport,      // yêu cầu tố cáo không hợp lệ
        InvalidRating,      // yêu cầu đánh giá không hợp lệ
        InvalidPoint,       // điểm đánh giá không hợp lệ
        NotYourContract,    //không phải hợp đồng của bạn


        //lỗi liên quan tới thương lượng
        NoNegotiator,       //không có người thương lượng
        HaveNegotiator,     //có người thượng lượng.
    }

    impl Account {
        //khởi tạo smc và lưu địa chỉ của người khởi tạo smc
        #[ink(constructor)]
        pub fn new() -> Self {
            let caller = Self::env().caller();
            let mut account = Self::default();
            account.owner_of_account = Some(caller);
            account

        }
        //msg chuyển tiền lời từ smc đến chủ sở hữu smc
        #[ink(message, payable)]
        pub fn withdraw(&mut self, amount: Balance) -> Result<(), JobError>{
            let caller = self.env().caller();
            if caller != self.owner_of_account.unwrap(){
                return Err(JobError::NotOwnerOfThisContract);
            }
            if amount > self.fee_balance {
                return Err(JobError::OverBalance);
            }
            let _ = self.env().transfer(caller, amount);
            Ok(())
        }
        //-----------------Helper fucntions --------------------
        fn check_caller_is_freelancer(&self, caller: AccountId) -> Result<(), JobError>{
            let caller_info = self.personal_account_info.get(caller);
            match caller_info.clone() {
                None => return Err(JobError::NotRegistered), //check đăng kí chưa
                Some(user_info) => {
                    //check role freelancer hay chưa
                    if user_info.role != AccountRole::FREELANCER {
                        return Err(JobError::NotFreelancer);
                    }
                }
            }
            Ok(())
        }

        fn check_caller_is_owner(&self, caller: AccountId) -> Result<(), JobError>{
            let caller_info = self.personal_account_info.get(caller);
            match caller_info.clone() {
                None => return Err(JobError::NotRegistered), //check đăng kí chưa
                Some(user_info) => {
                    //check role owner hay chưa
                    if user_info.role == AccountRole::FREELANCER {
                        return Err(JobError::NotJobAssigner);
                    }
                }
            }
            Ok(())
        }
        //---------------------------------------------------------
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
                rating_points: (0,0),
            };
            match self.personal_account_info.get(caller) {
                None => self.personal_account_info.insert(caller, &caller_info),
                _ => return Err(JobError::Registered),
                // _ => self.personal_account_info.insert(caller, &caller_info), //dùng để test và viết fe dễ hơn nếu cần
            };
            Self::env().emit_event(Registered {
                account_id: caller,
                account_role: role,
            });
            Ok(())
        }

        //check exist wallet => name và role (kiểm tra xem account này đã đăng kí trong smc chưa và trả về tên và vai trò của account)
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

        // get tất cả open job no parametter (open, reopen và auctioning)
        //--------------------> dùng trong đấu giá công việc
        #[ink(message)]
        pub fn get_all_open_jobs_no_params(&self) -> Result<Vec<Job>, JobError> {
            let mut jobs = Vec::<Job>::new();
            for i in 0..self.current_job_id {
                jobs.push(self.jobs.get(i).unwrap());
            }
            let open_jobs = jobs
                .into_iter()
                .filter(|job| job.status == Status::OPEN || job.status == Status::REOPEN || job.status == Status::AUCTIONING)
                .collect();
            Ok(open_jobs)
        }


        pub fn string_to_status(status: Vec<String>) -> Vec<Status>{
            let mut status_mapping: Mapping<String, Status> = Mapping::default();
            status_mapping.insert("open".to_string(), &Status::OPEN);
            status_mapping.insert("auctioning".to_string(), &Status::AUCTIONING);
            status_mapping.insert("doing".to_string(), &Status::DOING);
            status_mapping.insert("review".to_string(), &Status::REVIEW);
            status_mapping.insert("unqualified".to_string(), &Status::UNQUALIFIED);
            status_mapping.insert("reopen".to_string(), &Status::REOPEN);
            status_mapping.insert("finish".to_string(), &Status::FINISH);
            status_mapping.insert("canceled".to_string(), &Status::CANCELED);
            let mut res = Vec::new();
            for item in status {
                 res.push(status_mapping.get(item).unwrap());
            }
            res
        }
        // get tất cả các job của owner với trạng thái cho trước
        // ví dụ: muốn get open job, reopen job thì status_string = ["open", "reopen"];
        // ---------------------> query trong các dashboard
        #[ink(message)]
        pub fn get_all_jobs_of_owner_with_status(&self, status_string: Vec<String>) -> Result<Vec<Job>, JobError>{
            let owner = self.env().caller();
            let status = Self::string_to_status(status_string);
            let owner_job_id = self
                .owner_jobs
                .get(owner)
                .unwrap()
                .into_iter()
                .filter(|x| status.contains(&x.1))
                .collect::<Vec<(JobId,Status)>>();
            let mut result_jobs = Vec::new();
            for i in owner_job_id {
                result_jobs.push(self.jobs.get(i.0).unwrap())
            }
            Ok(result_jobs)
        }

        // get tất cả các job của freelancer với trạng thái cho trước
        // ví dụ: muốn get open job, reopen job thì status_string = ["open", "reopen"];
        // ---------------------> query trong các dashboard
        #[ink(message)]
        pub fn get_all_jobs_of_freelancer_with_status(&self, status_string: Vec<String>) -> Result<Vec<Job>, JobError>{
            let freelancer = self.env().caller();
            let status = Self::string_to_status(status_string);
            let freelancer_job_id = self
                .freelancer_jobs
                .get(freelancer)
                .unwrap()
                .into_iter()
                .filter(|x| status.contains(&x.1))
                .collect::<Vec<(JobId,Status)>>();
            let mut result_jobs = Vec::new();
            for i in freelancer_job_id {
                result_jobs.push(self.jobs.get(i.0).unwrap())
            }
            Ok(result_jobs)
        }

        //get tất cả open job theo category để freelancer lọc và chọn việc để đấu giá
        #[ink(message)]
        pub fn get_all_open_jobs(
            &mut self,
            string_category: String,
        ) -> Result<Vec<Job>, JobError> {
            let mut jobs = Vec::<Job>::new();
            for i in 0..self.current_job_id {
                jobs.push(self.jobs.get(i).unwrap());
            }
            let category = if string_category.to_lowercase().contains("it") {
                Category::IT
            } else if string_category.to_lowercase().contains("marketing"){
                Category::MARKETING
            } else if string_category.to_lowercase().contains("photoshop"){
                Category::PHOTOSHOP
            } else {
                Category::default()
            };
            let open_jobs = jobs
                .into_iter()
                .filter(|job| job.status == Status::OPEN || job.status == Status::REOPEN || job.status == Status::AUCTIONING)
                .filter(|job| job.category == category)
                .collect();
            Ok(open_jobs)
        }

        // get tối đa 20 freelancer => name, Vec<category>
        #[ink(message)]
        pub fn get_freelancer(&self, filter: String) -> Result<Vec<(String, Vec<Job>)>, JobError> {
            let category_filter = if filter.to_lowercase().contains("it"){
                Category::IT
            } else if filter.to_lowercase().contains("photoshop") {
                Category::PHOTOSHOP
            } else if filter.to_lowercase().contains("marketing") {
                Category::MARKETING
            } else {
                Category::NONE
            };
            let mut result: Vec<(String, Vec<Job>)> =  Vec::new();
            let n = self.all_freelancer.clone().len();
            let _all_freelancer = self.all_freelancer.clone();
            let mut count = 0;
            for i in 0..n {
                if count == 20 {break;}
                let jobs_id_option = self.freelancer_jobs.get(_all_freelancer[i]);
                if let Some(job_id) = jobs_id_option {
                    let m = job_id.len();
                    let freelancer_name = self.personal_account_info.get(_all_freelancer[i]).unwrap().name;
                    let mut freelancer_and_job = (freelancer_name, Vec::new());
                    for j in 0..m {
                        if self.jobs.get(job_id[j].0).unwrap().category == category_filter {
                            freelancer_and_job.1.push(self.jobs.get(job_id[j].0).unwrap())
                        }
                    }
                    //khi và vecto công việc khác rỗng thì add vào và tăng số đếm lên
                    if freelancer_and_job.1.len() > 0 {
                        result.push(freelancer_and_job);
                        count = count + 1;
                    }
                }
                
            }
            Ok(result)
        }

        //show thông tin account
        #[ink(message)]
        pub fn get_account_info(&self, caller: AccountId) -> Option<UserInfo> {
            self.personal_account_info.get(caller)
        }
        // show toàn bộ công việc của owner
        #[ink(message)]
        pub fn get_job_id_of_onwer(&self, owner: AccountId) -> Option<Vec<(JobId, Status)>> {
            self.owner_jobs.get(owner)
        }
        //show toàn bộ công việc của freelancer
        #[ink(message)]
        pub fn get_job_id_of_freelancer(&self, owner: AccountId) -> Option<Vec<(JobId, Status)>> {
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
            duration: u64,  //duration là nhập số ngày chú ý timestamp tính theo mili giây
            required_deposit_of_freelancer: Balance,
        ) -> Result<(), JobError> {
            let caller = self.env().caller();
            self.check_caller_is_owner(caller)?;
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
                negotiation_pay: 0,
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
                required_deposit_of_owner: 0,
                required_deposit_of_freelancer: required_deposit_of_freelancer,
            };
            self.jobs.insert(current_id, &job);
            // update owner_jobs
            match self.owner_jobs.contains(caller) {
                true => {
                    let mut jobs_of_caller = self.owner_jobs.get(caller).unwrap();
                    jobs_of_caller.push((current_id, Status::OPEN));
                    self.owner_jobs.insert(caller, &jobs_of_caller);
                }
                false => {
                    let mut jobs_of_caller = Vec::new();
                    jobs_of_caller.push((current_id, Status::OPEN));
                    self.owner_jobs.insert(caller, &jobs_of_caller);
                }
            }
            self.current_job_id = current_id + 1;
            //update user_info chỗ successful_jobs_and_all_jobs: all_jobs tăng thêm 1
            let mut owner_detail = self.personal_account_info.get(caller).unwrap();
            owner_detail.successful_jobs_and_all_jobs.1 =
                owner_detail.successful_jobs_and_all_jobs.1 + 1;
            self.personal_account_info.insert(caller, &owner_detail);
            //update tổng tiền phí thu được 
            self.fee_balance += deposite * (FEE_PERCENTAGE as u128) / 100;
            // Emit the event.
            Self::env().emit_event(JobCreated {
                name: name,
                description: description,
                deposite: deposite,
                // duration: duration,
            });
            Ok(())
        }

        #[ink(message)]
        pub fn job_auction (&mut self, job_id: JobId, desired_salary: u128, required_deposit_of_owner: Balance) -> Result<(), JobError> {
            // check caller đã đăng kí hay chưa và có phải là freelancer hay không
            let caller = self.env().caller();
            self.check_caller_is_freelancer(caller)?;
            //check công việc đó có tồn tại hay không và nó có hợp lệ để đấu giá hay không?
            let option_job = self.jobs.get(job_id);
            match option_job.clone() {
                None => return Err(JobError::NotExisted),
                Some(job) => {
                    if job.status != Status::OPEN && job.status != Status::REOPEN && job.status != Status::AUCTIONING {
                        return Err(JobError::Processing)
                    };
                    if self.env().block_timestamp() > job.end_time {
                        return Err(JobError::OutOfDate)
                    };
                },
            }
            let mut job = option_job.unwrap();
            if desired_salary > job.pay {
                return Err(JobError::InvalidBid)
            };
            //lấy thông tin đấu giá và tiến hành update
            let job_auctions_option = self.auction.get(job_id);
            match job_auctions_option {
                None => {
                    let mut new_job_auctions = Vec::new();
                    new_job_auctions.push((caller, desired_salary, required_deposit_of_owner));
                    self.auction.insert(job_id, &new_job_auctions);
                },
                Some(mut job_auctions) => {
                    if let Some(index) = job_auctions.iter().position(|x| x.0 == caller) { //nếu đấu giá lại thì thông tin được ghi đè.
                        job_auctions[index].1 = desired_salary;
                        job_auctions[index].2 = required_deposit_of_owner;
                        self.auction.insert(job_id, &job_auctions);
                    } else {
                        job_auctions.push((caller, desired_salary, required_deposit_of_owner));
                        self.auction.insert(job_id, &job_auctions);
                    }
                }
            }
            //update lại job đang ở trạng thái auction (open, reopen, auctioning => auctioning)
            job.status = Status::AUCTIONING;
            self.jobs.insert(job_id, &job);

            //Chỉnh lại trạng thái công việc đã thành công của onwer_jobs (người thứ hai trở đi auction vẫn ghi đè chỗ này)
            let mut owner_jobs = self.owner_jobs.get(job.person_create.unwrap()).unwrap();
            let index = owner_jobs.iter().position(|(x, _)| *x == job_id).unwrap();
            owner_jobs[index].1 = Status::AUCTIONING;
            self.owner_jobs.insert(job.person_create.unwrap(), &owner_jobs);
            //emit event
            Self::env().emit_event(JobAuction {
                job_id: job_id,
                desired_salary: desired_salary,
            });
            Ok(())
        }

        // onwer và freelancer sẽ tương tác với nhau qua web2 để phỏng vấn, trao đổi các thông tin: chi tiết công việc, điều khoản, phần trăm tiền freelancer nhận được nếu job không hoàn thành (do bên owner không hợp tác)
        // sẽ có vòng thương lượng để có thể thay đổi số tiền được trả nếu thương lượng thành công. (sử dụng tiền trong thương lượng làm tiền trả mà không dùng chỗ này nữa)
        // nếu freelancer không hợp tác thì không được hưởng khoản tiền trong hợp đồng này.
        #[ink(message, payable)]
        pub fn create_contract(&mut self, job_id: JobId, party_b: AccountId, rules: String, percent_paid_when_contract_fail: u8, duration: u8) -> Result<(), JobError> {
            let caller = self.env().caller();
            self.check_caller_is_owner(caller)?;
            let mut job = self.jobs.get(job_id).ok_or(JobError::NotExisted)?;
            //kiểm tra đã có hợp đồng với job đó hay chưa
            if self.contracts.get(job_id).is_some() {
                return Err(JobError::CreatedContract);
            }
            //check thông tin job có ok ko
            if job.person_create.unwrap() != caller {
                return Err(JobError::NotAssignThisJob);
            };
            if job.end_time < self.env().block_timestamp() {
                return Err(JobError::OutOfDate);
            };
            if job.status == Status::OPEN || job.status == Status::REOPEN {
                return Err(JobError::NoBidder)
            };
            if job.status != Status::AUCTIONING  {
                return Err(JobError::Processing)
            };
            let require_deposit = self.env().transferred_value();
            if let Some(index) = self.auction.get(job_id).unwrap().iter().position(|&x| x.0==party_b) {
                if require_deposit != self.auction.get(job_id).unwrap()[index].2 {
                    return Err(JobError::InvalidDeposit);
                }
            } else {
                return Err(JobError::NotBidder);
            }
            let contract = Contract{
                job_id: job_id,
                party_a: Some(caller),
                party_a_consent: Some(true),
                party_b: Some(party_b),
                party_b_consent: None,
                rules: rules,
                percent_paid_when_contract_fail: percent_paid_when_contract_fail,
                deadline_to_sign_contract: self.env().block_timestamp() + (duration as u64) * 60 * 60 * 1000, //duration sẽ là số giờ sau khi tạo contract thì freelancer phải kí
            };
            self.contracts.insert(job_id, &contract);
            // update lại thông tin job
            job.required_deposit_of_owner = require_deposit;
            self.jobs.insert(job_id, &job);
            Self::env().emit_event(CreateContract{
                job_id: job_id,
                onwer: caller,
                freelancer: party_b,
            });
            Ok(())
        }


        //hủy hợp đồng dùng khi quá hạn mà freelancer ko chịu kí hợp đồng
        #[ink(message, payable)]
        pub fn cancel_contract(&mut self, job_id: JobId) -> Result<(), JobError>{
            let caller = self.env().caller();
            self.check_caller_is_owner(caller)?;
            let contract_option = self.contracts.get(job_id);
            match contract_option {
                None => return Err(JobError::NotExistedThisContract),
                Some(contract) => {
                    match contract.party_a {
                        Some(a) if a == caller => {
                            if contract.deadline_to_sign_contract < self.env().block_timestamp() {
                                //xóa hợp đồng
                                self.contracts.remove(job_id);
                                //xóa người đã auction
                                let mut auctions_of_job = self.auction.get(job_id).unwrap();
                                auctions_of_job.retain(|&i| i.0 != contract.party_b.unwrap());
                                self.auction.insert(job_id, &auctions_of_job);
                                let required_deposit_of_owner = self.jobs.get(job_id).unwrap().required_deposit_of_owner;
                                let _ = self.env().transfer(caller, required_deposit_of_owner);
                            } else {
                                return Err(JobError::ConfirmationTimeNotExpires)
                            }
                        },
                        _ => return Err(JobError::NotPartyA),
                    }
                }
            }
            Ok(())
        }
        // kí hợp đồng và nhận việc
        #[ink(message, payable)]
        pub fn sign_contract_and_obtain(&mut self, job_id: JobId) -> Result<(), JobError>{
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
            let contract_option = self.contracts.get(job_id);
            match contract_option {
                None => return Err(JobError::NotExistedThisContract),
                Some(mut contract) => {
                    if contract.deadline_to_sign_contract < self.env().block_timestamp() {
                        return Err(JobError::ConfirmationTimeExpires);
                    }
                    if contract.party_b.unwrap() != caller {
                        return Err(JobError::NotPartyB)
                    } else {
                        if contract.party_b_consent == Some(true) {
                            return Err(JobError::Signed);
                        } else {
                            contract.party_b_consent = Some(true);
                            self.contracts.insert(job_id, &contract);
                        }
                    }
                }
            }
            //kiểm tra tiền freelancer đặt cọc có hợp lệ ko
            let deposit_of_caller = self.env().transferred_value();
            if deposit_of_caller != self.jobs.get(job_id).unwrap().required_deposit_of_freelancer {
                return Err(JobError::InvalidDeposit);
            }

            //obtain công việc, xem lại đấu giá job
            let desired_salary_vec = self.auction.get(job_id).unwrap();
            let position = desired_salary_vec.iter().position(|&x| x.0 == caller).unwrap();
            let desired_salary = desired_salary_vec[position].1;

            let mut job = self.jobs.get(job_id).unwrap();
            job.status = Status::DOING;
            job.person_obtain = Some(caller);
            job.pay = desired_salary;
            job.required_deposit_of_freelancer = deposit_of_caller;
            self.jobs.insert(job_id, &job);
            //Chỉnh lại trạng thái công việc của freelancer_jobs
            match self.freelancer_jobs.contains(caller) {
                true => {
                    let mut jobs_of_caller = self.freelancer_jobs.get(caller).unwrap();
                    jobs_of_caller.push((job_id, Status::DOING));
                    self.freelancer_jobs.insert(caller, &jobs_of_caller);
                }
                false => {
                    let mut jobs_of_caller = Vec::new();
                    jobs_of_caller.push((job_id, Status::DOING));
                    self.freelancer_jobs.insert(caller, &jobs_of_caller);
                }
            }
            //Chỉnh lại trạng thái công việc của onwer_jobs
            let mut owner_jobs = self.owner_jobs.get(job.person_create.unwrap()).unwrap();
            for element in owner_jobs.iter_mut() {
                if element.0 == job_id {
                    element.1 = Status::DOING;
                    break;
                }
            }
            self.owner_jobs.insert(job.person_create.unwrap(), &owner_jobs);

            //update user_info chỗ successful_jobs_and_all_jobs: all_jobs tăng thêm 1
            let mut freelancer_detail = caller_info.unwrap();
            freelancer_detail.successful_jobs_and_all_jobs.1 =
                freelancer_detail.successful_jobs_and_all_jobs.1 + 1;
            self.personal_account_info
                .insert(caller, &freelancer_detail);
            // Emit the event.
            Self::env().emit_event(SignAndJobObtained {
                job_id,
                freelancer: caller,
            });
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
                Status::OPEN | Status::REOPEN | Status::AUCTIONING => return Err(JobError::NotTakeThisJob),
                Status::REVIEW | Status::UNQUALIFIED => return Err(JobError::Submitted),
                Status::CANCELED => return Err(JobError::Canceled),
                Status::FINISH => return Err(JobError::Finished),
                Status::DOING => {
                    if job.end_time < self.env().block_timestamp() {                    //quá hạn job ko cho submit
                        return Err(JobError::OutOfDate)
                    }
                    // job.unqualifier = job.end_time < self.env().block_timestamp();   //quá hạn vẫn cho submit
                    job.result = Some(result.clone());
                    job.status = Status::REVIEW;
                    self.jobs.insert(job_id, &job);

                    //Chỉnh lại trạng thái công việc của onwer_jobs
                    let mut owner_jobs = self.owner_jobs.get(job.person_create.unwrap()).unwrap();
                    for element in owner_jobs.iter_mut() {
                        if element.0 == job_id {
                            element.1 = Status::REVIEW;
                            break;
                        }
                    }
                    self.owner_jobs.insert(job.person_create.unwrap(), &owner_jobs);

                    //Chỉnh lại trạng thái công việc của freelancer_jobs
                    let mut freelancer_jobs = self.freelancer_jobs.get(caller).unwrap();
                    for element in freelancer_jobs.iter_mut() {
                        if element.0 == job_id {
                            element.1 = Status::REVIEW;
                            break;
                        }
                    }
                    self.freelancer_jobs.insert(caller, &freelancer_jobs);

                    // Emit the event.
                    Self::env().emit_event(JobSubmitted {
                        job_id,
                        freelancer: caller,
                        result,
                    });
                }
            }

            Ok(())
        }


        //khi company thấy kết quả chưa hài lòng thì reject và feedback để freelancer biết. Sau đó cả hai sẽ bước vào vòng thương lượng.
        //Chỉ cho submit kết quả 1 lần duy nhất. mọi trao đổi trước khi submit sẽ thực hiện trên web2. nên khi job reject cả hai bên sẽ bước vào vòng thượng lượng.
        #[ink(message)]
        pub fn reject(&mut self, job_id: JobId, feedback: String) -> Result<(), JobError> {
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
                Status::OPEN | Status::REOPEN | Status::AUCTIONING => return Err(JobError::NotTaked),
                Status::DOING | Status::UNQUALIFIED => return Err(JobError::Processing),
                Status::CANCELED => return Err(JobError::Canceled),
                Status::FINISH => return Err(JobError::Finished),
                Status::REVIEW => {
                    if job.end_time < self.env().block_timestamp() {                    //quá hạn job ko cho reject
                        return Err(JobError::OutOfDate)
                    }
                    //update lại thông tin job để freelancer biết chưa hài lòng và để lại feedback
                    job.status = Status::UNQUALIFIED;
                    job.feedback = feedback;
                    self.jobs.insert(job_id, &job);
                    //Chỉnh lại trạng thái công việc của onwer_jobs
                    let mut owner_jobs = self.owner_jobs.get(job.person_create.unwrap()).unwrap();
                    for element in owner_jobs.iter_mut() {
                        if element.0 == job_id {
                            element.1 = Status::UNQUALIFIED;
                            break;
                        }
                    }
                    self.owner_jobs.insert(caller, &owner_jobs);

                    //Chỉnh lại trạng thái công việc của freelancer_jobs
                    let mut freelancer_jobs = self.freelancer_jobs.get(job.person_obtain.unwrap()).unwrap();
                    for element in freelancer_jobs.iter_mut() {
                        if element.0 == job_id {
                            element.1 = Status::UNQUALIFIED;
                            break;
                        }
                    }
                    self.freelancer_jobs.insert(job.person_obtain.unwrap(), &freelancer_jobs);
                    // Emit the event.
                    Self::env().emit_event(JobRejected {
                        job_id,
                        owner: caller,
                    });
                }
            }
            Ok(())
        }

        //khi kết quả của freelancer mà company cảm thấy hài lòng thì company đồng ý kết quả, kết thúc job và thực hiện chuyển tiền từ smc cho freelancer
        #[ink(message, payable)]
        pub fn approval(&mut self, job_id: JobId) -> Result<(), JobError> {
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
            if job.end_time < self.env().block_timestamp() {
                return Err(JobError::OutOfDate);
            }
            //check job đó có phải của mình hay không
            if job.person_create.unwrap() != caller {
                return Err(JobError::NotAssignThisJob);
            };
            match job.status {
                Status::OPEN | Status::REOPEN | Status::AUCTIONING => return Err(JobError::NotTaked),
                Status::DOING | Status::UNQUALIFIED => return Err(JobError::Processing),
                Status::CANCELED => return Err(JobError::Canceled),
                Status::FINISH => return Err(JobError::Finished),
                Status::REVIEW => {
                    //update lại thông tin job
                    job.status = Status::FINISH;
                    job.require_rating = (true, true);
                    self.jobs.insert(job_id, &job);
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

                    //Chỉnh lại trạng thái công việc của onwer_jobs
                    let mut owner_jobs = self.owner_jobs.get(job.person_create.unwrap()).unwrap();
                    for element in owner_jobs.iter_mut() {
                        if element.0 == job_id {
                            element.1 = Status::FINISH;
                            break;
                        }
                    }
                    self.owner_jobs.insert(caller, &owner_jobs);

                    //Chỉnh lại trạng thái công việc của freelancer_jobs
                    let mut freelancer_jobs = self.freelancer_jobs.get(job.person_obtain.unwrap()).unwrap();
                    for element in freelancer_jobs.iter_mut() {
                        if element.0 == job_id {
                            element.1 = Status::FINISH;
                            break;
                        }
                    }
                    self.freelancer_jobs.insert(job.person_obtain.unwrap(), &freelancer_jobs);

                    //chuyển tiền pay (desired_salary) và tiền required_deposit_of_freelancer cho freelancer
                    let _ = self.env().transfer(freelancer, job.pay + job.required_deposit_of_freelancer);
                    //chuyển tiền thừa lại cho company (tiền dư do freelancer yêu cầu lương ít hơn trong auction và tiền required_deposit_of_onwer)
                    let _ = self.env().transfer(caller, job.budget - job.pay + job.required_deposit_of_owner);
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

        //việc hủy job dành cho company khi và hủy trước khi có ai đó nhận việc job.
        //+ hủy job trước khi có người auction.
        //+ hết thời gian công việc mà ko có ai nhận thì công ty hủy job và lấy tiền về.
        #[ink(message, payable)]
        pub fn cancel(&mut self, job_id: JobId) -> Result<(), JobError> {
            let caller = self.env().caller();
            let caller_info = self.personal_account_info.get(caller);
            // kiểm tra đăng kí và role
            match caller_info {
                None => return Err(JobError::NotRegistered),
                Some(user_info) => {
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
                    // Set status to canceled and transfer balance to onwer
                    job.status = Status::CANCELED;
                    let _ = self.env().transfer(caller, job.budget + job.required_deposit_of_owner);
                    self.jobs.insert(job_id, &job);
                    // Set status to canceled and transfer balance to onwer
                    let mut _owner_jobs = self.owner_jobs.get(caller).unwrap();
                    for item in _owner_jobs.iter_mut() {
                        if item.0 == job_id {
                            item.1 = Status::CANCELED;
                            break;
                        }
                    }
                    self.owner_jobs.insert(caller, &_owner_jobs);
                },
                Status::AUCTIONING | Status::DOING | Status::REVIEW | Status::UNQUALIFIED => return Err(JobError::Processing),
                Status::CANCELED => return Err(JobError::Canceled), // job đã bị hủy
                Status::FINISH => return Err(JobError::Finished),   // job đã finish
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
            negotiation_pay: u128,
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
            match negotiation_pay {
                i if (i > 0 && i < job.pay) => {
                    // Validate job status
                    match job.status {
                        Status::UNQUALIFIED => {
                            // Send negotiation request
                            if job.request_negotiation == false {
                                job.negotiation_pay = negotiation_pay;
                                job.request_negotiation = true;
                                job.feedback = feedback;
                                job.requester = Some(caller);
                                self.jobs.insert(job_id, &job);
                            } else {
                                return Err(JobError::InvalidNegotiation);
                            }
                        }
                        Status::OPEN | Status::REOPEN | Status::AUCTIONING => return Err(JobError::NotTaked),
                        Status::DOING | Status::REVIEW => return Err(JobError::Processing),
                        Status::CANCELED => return Err(JobError::Canceled),
                        Status::FINISH => return Err(JobError::Finished),
                    }
                }
                _ => return Err(JobError::InvalidPayAmount),
            }
            // Emit the event.
            Self::env().emit_event(JobNegotiationRequested {
                job_id,
                requester: caller,
                negotiation_pay,
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
                _ => return Err(JobError::NoNegotiator),
            }

            match job.status {
                Status::UNQUALIFIED => {
                    if job.request_negotiation {
                        if agreement {
                            job.status = Status::FINISH;
                            self.jobs.insert(job_id, &job);
                            // Update job in storage
                            // Transfer funds
                            let _ = self.env().transfer(job.person_obtain.unwrap(), job.negotiation_pay + job.required_deposit_of_freelancer);
                            let _ = self
                                .env()
                                .transfer(job.person_create.unwrap(), job.budget - job.negotiation_pay + job.required_deposit_of_owner);
                            //Chỉnh lại trạng thái công việc đã thành công của onwer_jobs và freelancer_jobs
                            let owner = job.person_create.unwrap();
                            let mut owner_jobs_of_account_id = self.owner_jobs.get(owner).unwrap();
                            for element in owner_jobs_of_account_id.iter_mut() {
                                if element.0 == job_id {
                                    element.1 = Status::FINISH;
                                    break;
                                }
                            }
                            self.owner_jobs.insert(owner, &owner_jobs_of_account_id);

                            let freelancer = job.person_obtain.unwrap();
                            let mut freelancer_jobs_of_account_id =
                                self.freelancer_jobs.get(freelancer).unwrap();
                            for element in freelancer_jobs_of_account_id.iter_mut() {
                                if element.0 == job_id {
                                    element.1 = Status::FINISH;
                                    break;
                                }
                            }
                            self.freelancer_jobs
                                .insert(freelancer, &freelancer_jobs_of_account_id);
                        } else {
                            // If respond is don't agree
                            job.request_negotiation = false;
                            job.requester = None;
                            job.negotiation_pay = 0;
                            self.jobs.insert(job_id, &job);
                        }
                    } else {
                        return Err(JobError::InvalidNegotiation);
                    }
                }
                Status::OPEN | Status::REOPEN => return Err(JobError::NotAssignThisJob),
                Status::DOING | Status::REVIEW | Status::AUCTIONING => return Err(JobError::Processing),
                Status::CANCELED => return Err(JobError::Canceled),
                Status::FINISH => return Err(JobError::Finished),
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
            // chức năng này xây dựng cho trường hợp quá hạn luôn và cho cả hai bên gọi để xác định ai vi phạm hợp đồng (trường hợp chưa có ai nhận job sẽ làm trong cancel và nếu freelancer ko chịu kí hợp đồng thì sẽ có message hủy họợ đồng riêng. câu hỏi là nếu freelancer auction thì có yêu cầu deposit tiền vào ko, khi nào tạo hợp đồng thì người tạo sẽ chuyển tiền trả lại)
            // nếu ko phân định được ai đúng ai sai => làm theo hợp đồng: trả tiền được hưởng cho freelancer và trả lại tiền đặt cọc cho cả onwer và freelancer
            // nếu người sai là freelance => mất tiền đặt cọc, ko thanh toán tiền theo hợp đồng. (tiền đặt cọc chuyển cho onwer coi như đền bù)
            // nếu người sai là owner => mất tiền đặt cọc, thanh toán tiền theo hợp đồng. (tiền đặt cọc chuyển cho freelancer coi như đền bù)
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
            let mut _wrong_person = None;
            let owner = job.person_create.unwrap();
            let freelancer = job.person_obtain.unwrap();
            // Handle different status cases
            match job.status {
                // If the job is in the OPEN or REOPEN status, return error not take this job
                Status::OPEN | Status::REOPEN | Status::AUCTIONING | Status::CANCELED | Status::FINISH => return Err(JobError::InvalidTermination),
                Status::DOING => {
                    match (caller, job.unqualifier) {
                        (a, b) if (a == owner && b) => _wrong_person = Some(freelancer),
                        (a, b) if (a == owner && !b) => return Err(JobError::Processing),
                        (a, b) if (a == freelancer && b) => _wrong_person = Some(freelancer),
                        (a, b) if (a == freelancer && !b) => return Err(JobError::Processing),
                        _ => return Err(JobError::InvalidTermination),
                    }
                },

                Status::REVIEW => {
                    match (caller, job.unqualifier) {
                        (a, b) if (a == owner && b) => _wrong_person = Some(owner),
                        (a, b) if (a == owner && !b) => return Err(JobError::Processing),
                        (a, b) if (a == freelancer && b) => _wrong_person = Some(owner),
                        (a, b) if (a == freelancer && !b) => return Err(JobError::Processing),
                        _ => return Err(JobError::InvalidTermination),
                    }
                },
                // If the job is in the UNQUALIFIED status, không có ai đúng, ai sai, cứ theo contract mà làm
                Status::UNQUALIFIED => {
                    // Check if the caller and qualifier of job
                    match (caller, job.unqualifier) {
                        (a, b) if (a == owner && b) => job.reporter = None,
                        (a, b) if (a == owner && !b) => {
                            job.reporter = job.person_obtain
                        }
                        (a, b) if (a == job.person_obtain.unwrap() && b) => {
                            job.reporter = job.person_create
                        }
                        (a, b) if (a == job.person_obtain.unwrap() && !b) => job.reporter = None,
                        _ => return Err(JobError::InvalidTermination),
                    }
                }
            }
            
            //thực hiện chuyển tiền 
            match _wrong_person {
                //trong trường hợp ko có ai sai, chuyển tiền cho
                //+ freelancer: tiền phần trăm theo hợp đồng + tiền deposit bắt buộc
                //+ onwer: tiền còn lại sau khi chuyển cho freelancer + tiền deposit bắt buộc.
                None => {
                    let percent_paid_when_contract_fail = self.contracts.get(job_id).unwrap().percent_paid_when_contract_fail;
                    let balance_paid_for_freelancer = job.pay * percent_paid_when_contract_fail as u128 / 100;
                    let _ = self.env().transfer(freelancer, balance_paid_for_freelancer + job.required_deposit_of_freelancer);
                    let _ = self.env().transfer(owner, job.budget - balance_paid_for_freelancer + job.required_deposit_of_owner);
                    job.require_rating = (true, true);
                },
                Some(person) => {
                    //nếu lỗi là owner thì thanh toán theo hợp đồng và mất tiền cọc
                    if person == owner {
                        let percent_paid_when_contract_fail = self.contracts.get(job_id).unwrap().percent_paid_when_contract_fail;
                        let balance_paid_for_freelancer = job.pay * percent_paid_when_contract_fail as u128 / 100;
                        let _ = self.env().transfer(freelancer, balance_paid_for_freelancer + job.required_deposit_of_freelancer + job.required_deposit_of_owner);
                        let _ = self.env().transfer(owner, job.budget - balance_paid_for_freelancer);
                        job.reporter = Some(freelancer);
                        job.require_rating = (false, true);
                    }
                    //nếu lỗi là freelancer mất tiền cọc và ko thanh toán theo hợp đồng 
                    else if person == freelancer { 
                        let _ = self.env().transfer(owner, job.budget + job.required_deposit_of_owner + job.required_deposit_of_freelancer);
                        job.reporter = Some(owner);
                        job.require_rating = (true, false);
                    }
                }
            }
            //vì yêu cầu hủy có gắn với doing và review khi quá hạn nên để dễ, hủy job luôn không reopen nữa
            job.status = Status::FINISH;
            self.jobs.insert(job_id, &job);

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
            if job.reporter == None {
                return Err(JobError::InvalidReport);
            }
            match caller {
                x if x == job.reporter.unwrap() => {
                    job.reporter = None;
                    self.jobs.insert(job_id, &job);
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
        pub fn rating(&mut self, job_id: JobId, point: u8) -> Result<(), JobError> {
            if point > 6 || point == 0 {
                return Err(JobError::InvalidPoint);
            }
            let rating_points = vec![
                RatingPoint::OneStar, 
                RatingPoint::TwoStars, 
                RatingPoint::ThreeStars, 
                RatingPoint::FourStars,
                RatingPoint::FiveStars
            ];
            let rating_point = rating_points[point as usize - 1].clone();
            let mut job = self.jobs.get(job_id).ok_or(JobError::NotExisted)?;
            // Get the caller's address
            let caller = self.env().caller();
            // Retrieve caller info and validate that the caller is registered
            let _caller_info = self
                .personal_account_info
                .get(&caller)
                .ok_or(JobError::NotRegistered)?;
            match job.status {
                Status::OPEN | Status::REOPEN | Status::AUCTIONING => return Err(JobError::NotTaked),
                Status::DOING | Status::UNQUALIFIED | Status::REVIEW => {
                    return Err(JobError::Processing)
                }
                Status::CANCELED => return Err(JobError::Canceled),
                Status::FINISH => match (caller, job.require_rating) {
                    (a, (b, _)) if (a == job.person_create.unwrap() && b) => {
                        // update ratings
                        match self.ratings.contains(job.person_create.unwrap()) {
                            true => {
                                let mut ratings_of_onwer = self.ratings.get(caller).unwrap();
                                ratings_of_onwer.push((job_id, Some(rating_point.clone())));
                                self.ratings
                                    .insert(caller, &ratings_of_onwer);
                            }
                            false => {
                                let mut ratings_of_onwer = Vec::new();
                                ratings_of_onwer.push((job_id, Some(rating_point.clone())));
                                self.ratings
                                    .insert(caller, &ratings_of_onwer);
                            }
                        }
                        job.require_rating.0 = false;
                        self.jobs.insert(job_id, &job);
                        //rating cho user
                        let mut freelancer_info = self.personal_account_info.get(job.person_obtain.unwrap()).unwrap();
                        freelancer_info.rating_points.0 += point as u32;
                        freelancer_info.rating_points.1 += 1;
                        self.personal_account_info.insert(job.person_obtain.unwrap(), &freelancer_info);
                    }
                    (a, (_, c)) if (a == job.person_obtain.unwrap() && c) => {
                        // update ratings
                        match self.ratings.contains(job.person_obtain.unwrap()) {
                            true => {
                                let mut ratings_of_freelancer = self.ratings.get(caller).unwrap();
                                ratings_of_freelancer.push((job_id, Some(rating_point.clone())));
                                self.ratings
                                    .insert(caller, &ratings_of_freelancer);
                            }
                            false => {
                                let mut ratings_of_freelancer = Vec::new();
                                ratings_of_freelancer.push((job_id, Some(rating_point.clone())));
                                self.ratings
                                    .insert(caller, &ratings_of_freelancer);
                            }
                        }
                        job.require_rating.1 = false;
                        self.jobs.insert(job_id, &job);
                        //rating cho owner
                        let mut owner = self.personal_account_info.get(job.person_create.unwrap()).unwrap();
                        owner.rating_points.0 += point as u32;
                        owner.rating_points.1 += 1;
                        self.personal_account_info.insert(job.person_create.unwrap(), &owner);
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
        use ink::env::test::{self};

        // vec để set địa chỉ contract.
        const CONTRACT: [u8; 32] = [7; 32];

        // lấy dãy các account truy cập alice là [1;32] bob là [2;32]...
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

        //set balance 
        fn set_balance(account_id: AccountId, balance: Balance) {
            ink::env::test::set_account_balance::<ink::env::DefaultEnvironment>(
                account_id, balance,
            )
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
            let alice = default_accounts().alice;
            set_caller(alice);
            let contract_address: AccountId = AccountId::from(CONTRACT);
            set_callee(contract_address);
            Account::new()
        }
        //set thời gian để thực hiện 1 transaction
        fn set_block_timestamp(value: Timestamp){
            ink::env::test::set_block_timestamp::<ink::env::DefaultEnvironment>(value)
        }

        //hàm chuyển tiền từ caller sang callee
        fn transfer_in(caller: AccountId, callee: AccountId, value: Balance) {
            set_caller(caller);
            set_callee(callee);
            ink::env::test::transfer_in::<ink::env::DefaultEnvironment>(value);
        }

        //đăng kí onwer với role là individual
        fn register_owner(constract: &mut Account, caller: AccountId) -> Result<(), JobError>{
            set_caller(caller);
            let name = "User".to_string();
            let detail = "User information".to_string();
            let string_role = "individual".to_string();
            constract.register(name, detail, string_role)?;
            Ok(())
        }

        //đăng kí account với role là freelancer
        fn register_freelancer(constract: &mut Account, caller: AccountId) -> Result<(), JobError>{
            set_caller(caller);
            let name = "Freelancer".to_string();
            let detail = "Freelancer information".to_string();
            let string_role = "freelancer".to_string();
            constract.register(name, detail, string_role)?;
            Ok(())
        }
        //tạo job với thời hạn là 1 ngày, budget là 100 và của require freelancer là 10, time_create_job tính bằng mili giây
        fn create_new_job(contract: &mut Account, caller: AccountId, time_create_job: Timestamp) -> Result<(), JobError> {
            let name = "user's job".to_string();
            let description = "detail of user's job".to_string();
            let string_category = "it".to_string();
            let duration: u64 = 1;
            let required_deposit_of_freelancer = 10;
            //set số lượng tiền deposit vào smartcontract.
            transfer_in(caller, contract.env().account_id(), 100);
            //set block time_stamp bằng time_create_job => start_time = time_create_job
            set_block_timestamp(time_create_job);
            contract.create_job(name, description, string_category, duration, required_deposit_of_freelancer)?;
            Ok(())
        }

        //đăng kí với tên và role (f: freelancer, c: company)
        fn register_user_with_role_for(account: &mut Account, name: &str, role: char) -> Option<AccountId> {
            let user_option = match name {
                "alice" => Some(default_accounts().alice),
                "bob" => Some(default_accounts().bob),
                "eve" => Some(default_accounts().eve),
                "charlie" => Some(default_accounts().charlie),
                _ => None,
            };
            let role = if role == 'f' {
                "freelancer"
            } else {
                "teamlead"
            };

            if let Some(user) = user_option {
                set_balance(user, 200);
                set_caller(user);
                let _ = account.register(
                    name.to_string(),
                    "detail".to_string(),
                    role.to_string(),
                );
            }
            user_option
        }

        //hàm đấu giá job
        fn auction_job (account: &mut Account, freelancer: AccountId, job_id: JobId, desired_salary: u128, required_deposit_of_owner: Balance) -> Result<(), JobError> {
            set_caller(freelancer);
            account.job_auction(job_id, desired_salary, required_deposit_of_owner)?;
            Ok(())
        }

        //hàm tạo hợp đồng
        fn create_contract (account: &mut Account, party_a: AccountId, balance_of_party_a: Balance, job_id: JobId, party_b: AccountId, percent_paid_when_contract_fail: u8, duration: u8, time_create_contract: Timestamp) -> Result<(), JobError> {
            transfer_in(party_a, account.env().account_id(), balance_of_party_a);
            let rule = String::from("These are the terms of the contract");
            set_block_timestamp(time_create_contract);
            account.create_contract(job_id, party_b, rule, percent_paid_when_contract_fail, duration)?;
            Ok(())
        }

        //hàm hủy hợp đồng
        fn cancel_contract(account: &mut Account, caller: AccountId, job_id: JobId, time_cancel: Timestamp) -> Result<(), JobError> {
            set_block_timestamp(time_cancel);
            set_caller(caller);
            account.cancel_contract(job_id)?;
            Ok(())
        }

        //hàm kí hợp đồng và nhận việc
        fn sign_contract_and_obtain (account: &mut Account, freelancer: AccountId, balance: Balance, job_id: JobId, time_sign_and_obtain: Timestamp) -> Result<(), JobError>{
            set_block_timestamp(time_sign_and_obtain);
            transfer_in(freelancer, account.env().account_id(), balance); 
            account.sign_contract_and_obtain(job_id)?;
            Ok(())
        }

        //hàm submit job
        fn submit_job(contract: &mut Account, caller: AccountId, job_id: u128, time_submit: Timestamp) -> Result<(), JobError> {
            set_caller(caller);
            set_block_timestamp(time_submit);
            let result_job = "this is a result of this job".to_string();
            contract.submit(job_id, result_job)?;
            Ok(())
        }

        //hàm approval job
        fn approval(contract: &mut Account, caller: AccountId, job_id: u128, time_approval: Timestamp) -> Result<(), JobError> {
            set_caller(caller);
            set_block_timestamp(time_approval);
            contract.approval(job_id)?;
            Ok(())
        }

        //hàm reject job
        fn reject_job(contract: &mut Account, caller: AccountId, job_id: u128, time_reject: Timestamp) -> Result<(), JobError> {
            set_block_timestamp(time_reject);
            set_caller(caller);
            contract.reject(job_id, "ly do chua hai long voi cong viec nay".to_string())?;
            Ok(())
        }

        //hàm request_negotiate
        fn request_negotiate(contract: &mut Account, caller: AccountId, job_id: u128, feedback: String, negotiation_pay: Balance) -> Result<(), JobError> {
            set_caller(caller);
            contract.request_negotiate(job_id, feedback, negotiation_pay)?;
            Ok(())
        }

        //hàm respond_negotiate
        fn respond_negotiate(contract: &mut Account, caller: AccountId, job_id: u128, agreement: bool) -> Result<(), JobError> {
            set_caller(caller);
            contract.respond_negotiate(job_id, agreement)?;
            Ok(())
        }

        //hàm set time và status job
        fn set_job_status_and_end_time(contract: &mut Account, job_id: JobId, status: Status, time_terminate: Timestamp){
            set_block_timestamp(time_terminate);
            let mut job = contract.jobs.get(job_id).unwrap();
            job.status = status;
            contract.jobs.insert(job_id, &job);
        }

        #[ink::test]
        fn test_register_success() {
            //build contract với địa chỉ là [7;32]
            let mut account = build_contract();
            //check lại đúng địa chỉ [7;32] chưa
            assert_eq!(account.env().account_id(), get_address_contract());
            //check lại chủ sở hữu contract có phải là alice hay không?
            assert_eq!(account.owner_of_account, Some(default_accounts().alice));
            //kiểm tra tổng tiền phí trong smc 
            assert_eq!(account.fee_balance, 0);
            //lấy account alice và set người gọi là alice
            let alice = default_accounts().alice;
            // let bob = default_accounts().bob;
            set_caller(alice);
            let result = account.register(
                "Alice".to_string(),
                "Alice's details".to_string(),
                "individual".to_string(),
            );
            assert!(result.is_ok());
            let caller_info = account.personal_account_info.get(&alice).unwrap();
            let alice_info = UserInfo{
                name: String::from("Alice"),
                detail: String::from("Alice's details"),
                role: AccountRole::INDIVIDUAL,
                successful_jobs_and_all_jobs: (0,0),
                rating_points: (0,0),
            };
            assert_eq!(caller_info, alice_info);
            //-------------test register với account khác là bob---------------------------------
            let bob = default_accounts().bob;
            set_caller(bob);
            let _ = account.register(
                "Bob".to_string(),
                "Bob's details".to_string(),
                "freelancer".to_string(),
            );
            assert_eq!(account.all_freelancer, vec![bob]);
            //test check_exist_wallet.
            //alice
            set_caller(alice);
            let result = account.check_exist_wallet();
            assert_eq!(result, (String::from("Alice"), String::from("company")));
            //bob
            set_caller(bob);
            let result = account.check_exist_wallet();
            assert_eq!(result, (String::from("Bob"), String::from("freelancer")));
            //caller là freelancer hay onwer
            assert_eq!(account.check_caller_is_freelancer(alice),Err(JobError::NotFreelancer));
            assert_eq!(account.check_caller_is_freelancer(bob),Ok(()));
            assert_eq!(account.check_caller_is_owner(alice),Ok(()));
            assert_eq!(account.check_caller_is_owner(bob),Err(JobError::NotJobAssigner));   
            //check all_freelancer
            assert_eq!(account.all_freelancer, vec![bob]);      
        }

        #[ink::test]
        fn test_register_should_fail() {
            //build contract với địa chỉ là [7;32]
            let mut account = build_contract();
            //lấy account alice và set người gọi là alice
            let alice = default_accounts().alice;
            // let bob = default_accounts().bob;
            set_caller(alice);
            let _ = account.register(
                "Alice".to_string(),
                "Alice's details".to_string(),
                "individual".to_string(),
            );
            let result = account.register(
                "Alice".to_string(),
                "Alice's details".to_string(),
                "individual".to_string(),
            );
            assert_eq!(result,Err(JobError::Registered))
        }

        #[ink::test]
        fn test_create_job_success() {
            //build contract với địa chỉ là [7;32]
            let mut account = build_contract();
            let account_address = get_address_contract();
            //lấy alice và set caller là alice, set_balance cho alice
            let alice = default_accounts().alice;
            set_caller(alice);
            set_balance(alice, 200);
            // set_callee(account.env().account_id());
            let _resut_create_account = account.register(
                "Alice".to_string(),
                "Alice's details".to_string(),
                "individual".to_string(),
            );
            //cách tính số tiền deposit vào smc
            //tạo job => 100 = 97(budget) + 3(phí) 
            //set số lượng tiền deposit vào smartcontract.
            transfer_in(alice, account_address, 100);
            //set block time_stamp bằng 10 => start_time = 10
            set_block_timestamp(10);
            // Create a new job.
            let result = account.create_job(
                "My new job".to_string(),
                "This is a description of my new job.".to_string(),
                "it".to_string(),
                1, // 1 day
                10, //tiền yêu cầu của freelancer
            );
            //kiểm tra balance của alice và của contract
            assert_eq!(get_balance_of(alice),100);
            assert_eq!(get_balance_of(account_address),100);
            //kiểm tra onchain storage đúng hay chưa
            assert!(result.is_ok());
            //kiểm tra thông tin job index 0
            let job = account.jobs.get(0).unwrap();
            let job_info = Job {
                name: String::from("My new job"),
                job_id: 0,
                description: String::from("This is a description of my new job."),
                category: Category::IT,
                result: None,
                status: Status::OPEN,
                budget: 97,                  
                fee_percentage: 3,              
                start_time: 10,            
                end_time: 10 + 24 * 60 * 60 * 1000, 
                person_create: Some(alice), 
                person_obtain: None,
                pay: 97,
                negotiation_pay: 0,
                feedback: String::new(),
                request_negotiation: false,
                requester: None,
                reporter: None,
                require_rating: (false, false),
                unqualifier: false,
                required_deposit_of_owner: 0,
                required_deposit_of_freelancer: 10, 
            };
            assert_eq!(job,job_info);
            //kiểm tra current_job_id 
            assert_eq!(account.current_job_id, 1);
            //check sự thay đổi account_info của alice
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
                Vec::from([(0, Status::OPEN)])
            );
            //kiểm tra tổng tiền phí
            assert_eq!(account.fee_balance, 3);
        }



        #[ink::test]
        fn test_create_job_should_fail() {
            //build contract với địa chỉ là [7;32]
            let mut account = build_contract();
            //lấy alice, set_balance cho alice, đăng kí owner cho alice
            let alice = default_accounts().alice;
            set_balance(alice, 99);
            let _ = register_owner(&mut account, alice);
            //------------------------------------------
            //check với alice => ko đủ balance => panic
            // let result = create_new_job(&mut account, alice, 10000);
            //------------------------------------------
            //lấy bob, set_balance cho bob, đăng kí freelancer cho bob
            let bob = default_accounts().bob;
            set_balance(bob, 200);
            let _ = register_freelancer(&mut account, bob);
            let result = create_new_job(&mut account, bob, 10000);
            assert_eq!(result, Err(JobError::NotJobAssigner));
            //lấy eve, set_balance cho eve, không đăng ký tk cho eve
            let eve = default_accounts().eve;
            set_balance(eve, 200);
            let _ = register_freelancer(&mut account, eve);
        }

        #[ink::test]
        fn test_get_all_jobs_of_owner_with_status() {
            let mut account = build_contract();
            let alice = default_accounts().alice;
            let _ = register_owner(&mut account, alice);
            let _ = create_new_job(&mut account, alice, 10000);
            let _ = create_new_job(&mut account, alice, 10000);
            let _ = create_new_job(&mut account, alice, 10000);
            let mut job_2 = account.jobs.get(2).unwrap();
            job_2.status = Status::DOING;
            account.jobs.insert(2, &job_2);
            let res = Account::get_all_jobs_of_owner_with_status(&account, vec!["open".to_string(), "doing".to_string()]);
            let desired_results = Ok(vec![
                Job {
                    name: String::from("user's job"),
                    job_id: 0,
                    description: String::from("detail of user's job"),
                    category: Category::IT,
                    result: None,
                    status: Status::OPEN,
                    budget: 97,                  
                    fee_percentage: 3,              
                    start_time: 10000,            
                    end_time: 86410000, 
                    person_create: Some(alice), 
                    person_obtain: None,
                    pay: 97,
                    negotiation_pay: 0,
                    feedback: String::new(),
                    request_negotiation: false,
                    requester: None,
                    reporter: None,
                    require_rating: (false, false),
                    unqualifier: false,
                    required_deposit_of_owner: 0,
                    required_deposit_of_freelancer: 10, 
                },
                Job {
                    name: String::from("user's job"),
                    job_id: 1,
                    description: String::from("detail of user's job"),
                    category: Category::IT,
                    result: None,
                    status: Status::OPEN,
                    budget: 97,                  
                    fee_percentage: 3,              
                    start_time: 10000,            
                    end_time: 86410000, 
                    person_create: Some(alice), 
                    person_obtain: None,
                    pay: 97,
                    negotiation_pay: 0,
                    feedback: String::new(),
                    request_negotiation: false,
                    requester: None,
                    reporter: None,
                    require_rating: (false, false),
                    unqualifier: false,
                    required_deposit_of_owner: 0,
                    required_deposit_of_freelancer: 10, 
                },
                Job {
                    name: String::from("user's job"),
                    job_id: 2,
                    description: String::from("detail of user's job"),
                    category: Category::IT,
                    result: None,
                    status: Status::DOING,
                    budget: 97,                  
                    fee_percentage: 3,              
                    start_time: 10000,            
                    end_time: 86410000, 
                    person_create: Some(alice), 
                    person_obtain: None,
                    pay: 97,
                    negotiation_pay: 0,
                    feedback: String::new(),
                    request_negotiation: false,
                    requester: None,
                    reporter: None,
                    require_rating: (false, false),
                    unqualifier: false,
                    required_deposit_of_owner: 0,
                    required_deposit_of_freelancer: 10, 
                }
            ]);
            assert_eq!(res, desired_results);
        }

        #[ink::test]
        fn test_job_auction_success() {
            let mut account = build_contract();
            //đăng kí 3 account là alice (company), bob (freelancer) và charlie (freelancer)
            let alice = register_user_with_role_for(&mut account, "alice", 'c').unwrap();
            let bob = register_user_with_role_for(&mut account, "bob", 'f').unwrap();
            let charlie = register_user_with_role_for(&mut account, "charlie", 'f').unwrap();
            //check all_freelancer 
            assert_eq!(account.all_freelancer, vec![bob,charlie]);
            //alice tạo job
            let _ = create_new_job(&mut account, alice, 10000);
            //kiểm tra status job trước khi auction 
            assert_eq!(account.jobs.get(0).unwrap().status, Status::OPEN);
            //bob và charlie auction job 
            set_caller(bob);
            let _ = account.job_auction(0, 10, 20);
            set_caller(charlie);
            let _ = account.job_auction(0, 9, 21);
            //check auction
            let auction_of_job_0 = account.auction.get(0).unwrap();
            assert_eq!(
                auction_of_job_0,
                vec![
                    (bob, 10, 20),
                    (charlie, 9, 21)
                ]
            );
            //check auction again
            set_caller(bob);
            let _ = account.job_auction(0, 7, 17);
            let auction_of_job_0 = account.auction.get(0).unwrap();
            assert_eq!(
                auction_of_job_0,
                vec![
                    (bob, 7, 17),
                    (charlie, 9, 21)
                ]
            );
            //kiểm tra status job
            assert_eq!(account.jobs.get(0).unwrap().status, Status::AUCTIONING);
            assert_eq!(account.owner_jobs.get(alice).unwrap(), vec![(0, Status::AUCTIONING)]);
        }

        #[ink::test]
        fn test_job_auction_should_fail() {
            let mut account = build_contract();
            //đăng kí 3 account là alice (company), bob (company) và charlie (chưa đăng kí)
            let alice = register_user_with_role_for(&mut account, "alice", 'c').unwrap();
            let bob = register_user_with_role_for(&mut account, "bob", 'c').unwrap();
            let eve = register_user_with_role_for(&mut account, "eve", 'f').unwrap();
            let charlie = default_accounts().charlie;
            //alice tạo job
            let _ = create_new_job(&mut account, alice, 10000);
            //test bob auction
            set_caller(bob);
            let res = account.job_auction(0, 10, 20);
            assert_eq!(res, Err(JobError::NotFreelancer));
            //test charlie auction 
            set_caller(charlie);
            let res = account.job_auction(0, 10, 20);
            assert_eq!(res, Err(JobError::NotRegistered));
            //check eve auction 1 job không tồn tại
            set_caller(eve);
            let res = account.job_auction(1, 10, 20);
            assert_eq!(res, Err(JobError::NotExisted));
            //--------------------- tùy chỉnh thông tin job và test ----------------
            //test status
            let mut job_0 = account.jobs.get(0).unwrap();
            for status in vec![Status::DOING, Status::REVIEW, Status::UNQUALIFIED, Status::FINISH, Status::CANCELED]{
                job_0.status = status;
                account.jobs.insert(0, &job_0);
                set_caller(eve);
                let res = account.job_auction(0, 10, 20);
                assert_eq!(res, Err(JobError::Processing));
            }
            //test time
            job_0.status = Status::OPEN;
            account.jobs.insert(0, &job_0);
            set_caller(eve);
            set_block_timestamp(86420000); //1 ngày 12 giây
            let res = account.job_auction(0, 10, 20);
            assert_eq!(res, Err(JobError::OutOfDate));
            //test desired_salary
            set_caller(eve);
            set_block_timestamp(1602);
            let res = account.job_auction(0, 100, 20);
            assert_eq!(res, Err(JobError::InvalidBid));
        }   


        #[ink::test]
        fn test_create_contract_success() {
            let mut account = build_contract();
            //đăng kí 3 account là alice (company), bob (freelancer) và eve (freelancer)
            let alice = register_user_with_role_for(&mut account, "alice", 'c').unwrap();
            let bob = register_user_with_role_for(&mut account, "bob", 'f').unwrap();
            let eve = register_user_with_role_for(&mut account, "eve", 'f').unwrap();
            //alice tạo job
            let _ = create_new_job(&mut account, alice, 10000);
            //bob auction job
            let _ = auction_job(&mut account, bob, 0, 10, 20);
            //eve auction job 
            let _ = auction_job(&mut account, eve, 0, 8, 20);
            //alice chọn bob và tạo hợp đồng
            let rule = String::from("These are the terms of the contract");
            transfer_in(alice, account.env().account_id(), 20);
            set_block_timestamp(10000);  //set time cho tx tiếp theo (nếu ko có dòng này thì time vẫn là 10s)
            let res = account.create_contract(0, bob, rule, 5, 2); //(job_id, party_b, rule, percent_paid_when_contract_fail, duration)
            assert_eq!(res, Ok(()));
            //--------------------- check onchain storage ----------------------------
            //check account alice 
            assert_eq!(get_balance_of(alice), 80); //200 - 100 - 20
            assert_eq!(get_balance_of(account.env().account_id()), 120); //100 + 20
            //check jobs
            assert_eq!(account.jobs.get(0).unwrap().status, Status::AUCTIONING);
            //check owner_jobs
            assert_eq!(account.owner_jobs.get(alice).unwrap(), vec![(0, Status::AUCTIONING)]);
            //check contract 
            assert_eq!(
                account.contracts.get(0).unwrap(),
                Contract {
                    job_id: 0,
                    party_a: Some(alice),
                    party_a_consent: Some(true),
                    party_b: Some(bob),
                    party_b_consent: None,
                    rules: String::from("These are the terms of the contract"),
                    percent_paid_when_contract_fail: 5,
                    deadline_to_sign_contract: 7210000,  //10 giây cộng 2 giờ deadline ký hợp đồng
                }
            )

        }

        #[ink::test]
        fn test_create_contract_should_fail() {
            let mut account = build_contract();
            //đăng kí account là alice (company), charlie (company), bob (freelancer), eve (freelancer)
            let alice = register_user_with_role_for(&mut account, "alice", 'c').unwrap();
            let charlie = register_user_with_role_for(&mut account, "charlie", 'c').unwrap();
            let bob = register_user_with_role_for(&mut account, "bob", 'f').unwrap();
            let eve = register_user_with_role_for(&mut account, "eve", 'f').unwrap();
            let django = default_accounts().django;
            set_balance(django, 200);
            //alice tạo job
            set_balance(alice, 200000); //set lại balance cho alice để tạo job nếu ko sẽ báo lỗi ko overflow (ko đủ balance)
            let _ = create_new_job(&mut account, alice, 10000); //job 0
            let _ = create_new_job(&mut account, alice, 20000); //job 1
            //bob auction job 0
            let _ = auction_job(&mut account, bob, 0, 10, 20);
            //eve auction job 0
            let _ = auction_job(&mut account, eve, 0, 8, 20);
            //test hợp đồng đã tồn tại hay chưa
            //create_contract (account: &mut Account, party_a: AccountId, balance_of_party_a: Balance, job_id: JobId, party_b: AccountId, percent_paid_when_contract_fail: u8, duration: u8) -> Result<(), JobError> 
            let res = create_contract(&mut account, alice, 20, 0, bob, 5, 2, 30000);
            assert_eq!(res, Ok(()));
            let res = create_contract(&mut account, alice, 20, 0, bob, 5, 2, 30000);
            assert_eq!(res, Err(JobError::CreatedContract));
            let res = create_contract(&mut account, alice, 20, 0, eve, 5, 2, 30000);
            assert_eq!(res, Err(JobError::CreatedContract));
            //test role của người gọi
            let res = create_contract(&mut account, django, 20, 1, bob, 5, 2, 30000);
            assert_eq!(res, Err(JobError::NotRegistered));
            let res = create_contract(&mut account, eve, 20, 1, bob, 5, 2, 30000);
            assert_eq!(res, Err(JobError::NotJobAssigner));
            //kiểm tra thông tin job để tạo contract 
            //test job có tồn tại hay không
            let res = create_contract(&mut account, alice, 20, 3, bob, 5, 2, 30000);
            assert_eq!(res, Err(JobError::NotExisted));
            //test người gọi có phải nguòi tạo job hay không
            let res = create_contract(&mut account, charlie, 20, 1, bob, 5, 2, 30000);
            assert_eq!(res, Err(JobError::NotAssignThisJob));
            //check out_of_date
            let res = create_contract(&mut account, alice, 20, 1, bob, 5, 2, 86420001); //lớn hơn 20s + 1 ngày
            assert_eq!(res, Err(JobError::OutOfDate));
            //check có người auction hay chưa
            let res = create_contract(&mut account, alice, 20, 1, bob, 5, 2, 30000); 
            assert_eq!(res, Err(JobError::NoBidder));
            //------------------------- check status job - chỉnh sửa job để test -----------------------------
            let _ = auction_job(&mut account, bob, 1, 8, 20);
            //bob auction vào job 1
            let mut job1 = account.jobs.get(1).unwrap();
            for status in vec![Status::OPEN, Status::REOPEN] {
                job1.status = status;
                account.jobs.insert(1, &job1);
                let res = create_contract(&mut account, alice, 20, 1, bob, 5, 2, 30000); 
                assert_eq!(res, Err(JobError::NoBidder));
            }
            for status in vec![Status::DOING, Status::REVIEW, Status::UNQUALIFIED, Status::FINISH, Status::CANCELED]{
                job1.status = status;
                account.jobs.insert(1, &job1);
                let res = create_contract(&mut account, alice, 20, 1, bob, 5, 2, 30000); 
                assert_eq!(res, Err(JobError::Processing));
            }
            //test require_deposit của party a chuyển vào vào
            //chỉnh lại status job 1
            job1.status = Status::OPEN;
            account.jobs.insert(1, &job1);
            //bob auction vào job 1 auction vào job 1
            let _ = auction_job(&mut account, bob, 1, 97, 20);
            //alice tạo hợp đồng với bob - job 1 nhưng deposit sai
            //param thứ 3 sai => 20 mới đúng
            let res = create_contract(&mut account, alice, 19, 1, bob, 5, 2, 30000); 
            assert_eq!(res, Err(JobError::InvalidDeposit));
        }

        #[ink::test]
        fn test_cancel_contract_success() {
            let mut account = build_contract();
            let alice = register_user_with_role_for(&mut account, "alice", 'c').unwrap();
            // assert_eq!(get_balance_of(alice), 200);
            let charlie = register_user_with_role_for(&mut account, "charlie", 'f').unwrap();
            let _ = create_new_job(&mut account, alice, 10000); //job 0
            // assert_eq!(get_balance_of(alice), 100);
            let _ = auction_job(&mut account, charlie, 0, 97, 20);
            let _ = create_contract(&mut account, alice, 20, 0, charlie, 5, 2, 30000);
            assert_eq!(get_balance_of(alice), 80);
            // assert_eq!(get_balance_of(account.env().account_id()), 120);
            // assert_eq!((account.jobs.get(0).unwrap().budget, account.jobs.get(0).unwrap().required_deposit_of_owner), (97, 20));
            //hạn kí hợp đồng là 30s + 2 giờ
            set_block_timestamp(7230001); //sau hạn 1 mili giây
            set_caller(alice);
            let res = account.cancel_contract(0);
            assert_eq!(res, Ok(()));
            //kiểm tra onchain-storage
            assert_eq!(account.contracts.get(0), None);
            assert_eq!(
                account.auction.get(0).unwrap(),
                Vec::new()
            );
            //kiểm tra balance 
            assert_eq!(get_balance_of(alice), 100); //80 + 20 = 100
        }

        #[ink::test]
        fn test_cancel_contract_should_fail() {
            let mut account = build_contract();
            let alice = register_user_with_role_for(&mut account, "alice", 'c').unwrap();
            let bob = register_user_with_role_for(&mut account, "bob", 'c').unwrap();
            let charlie = register_user_with_role_for(&mut account, "charlie", 'f').unwrap();
            let eve = default_accounts().eve;
            set_balance(eve, 200);
            let _ = create_new_job(&mut account, alice, 10000); //job 0
            let _ = auction_job(&mut account, charlie, 0, 97, 20);
            let _ = create_contract(&mut account, alice, 20, 0, charlie, 5, 2, 30000);
            //test eve
            let res = cancel_contract(&mut account, eve, 0, 7230000);
            assert_eq!(res, Err(JobError::NotRegistered));
            //test charlie
            let res = cancel_contract(&mut account, charlie, 0, 7230000);
            assert_eq!(res, Err(JobError::NotJobAssigner));
            //test contract ko tồn tại
            let res = cancel_contract(&mut account, alice, 1, 7230000);
            assert_eq!(res, Err(JobError::NotExistedThisContract));
            //test chưa quá deadline kí hợp đồng
            let res = cancel_contract(&mut account, alice, 0, 7230000);
            assert_eq!(res, Err(JobError::ConfirmationTimeNotExpires)); 
            //test với caller ko phải party a
            let res = cancel_contract(&mut account, bob, 0, 7230001);
            assert_eq!(res, Err(JobError::NotPartyA)); 
        }

        #[ink::test]
        fn test_sign_contract_and_obtain_success() {
            let mut account = build_contract();
            let alice = register_user_with_role_for(&mut account, "alice", 'c').unwrap();
            // assert_eq!(get_balance_of(alice), 200);
            let bob = register_user_with_role_for(&mut account, "bob", 'f').unwrap();
            // assert_eq!(get_balance_of(bob), 200);
            let _ = create_new_job(&mut account, alice, 10000); //job 0
            // assert_eq!(get_balance_of(alice), 100);
            let _ = auction_job(&mut account, bob, 0, 97, 20);
            let _ = create_contract(&mut account, alice, 20, 0, bob, 5, 2, 30000);
            // assert_eq!(get_balance_of(alice), 80);
            transfer_in(bob, account.env().account_id(),10); //cài đặt bob chuyển tiền vào smc 
            let res = account.sign_contract_and_obtain(0);
            assert_eq!(res, Ok(()));
            //-------------kiểm tra lại thông tin --------------------------
            //check balance 
            assert_eq!(get_balance_of(account.env().account_id()), 130); //100(tạo job) + 20 (create_contract) + 10 (sign_and_obtain)
            assert_eq!(get_balance_of(alice), 80);
            assert_eq!(get_balance_of(bob), 190);
            //check jobs information
            let job_0 = account.jobs.get(0).unwrap();
            assert_eq!(
                (job_0.status, job_0.person_obtain, job_0.required_deposit_of_owner, job_0.required_deposit_of_freelancer),
                (Status::DOING, Some(bob), 20, 10)
            );
            //check personnal_account_info
            let bob_account_info = account.personal_account_info.get(bob).unwrap();
            assert_eq!(bob_account_info.successful_jobs_and_all_jobs.1, 1);
            //check_owner_job
            assert_eq!(account.owner_jobs.get(alice).unwrap(), vec![(0,Status::DOING)]);
            //check_freelancer_job
            assert_eq!(account.freelancer_jobs.get(bob).unwrap(), vec![(0,Status::DOING)]);
        }


        #[ink::test]
        fn test_sign_contract_and_obtain_should_fail() {
            let mut account = build_contract();
            let alice = register_user_with_role_for(&mut account, "alice", 'c').unwrap();
            let bob = register_user_with_role_for(&mut account, "bob", 'f').unwrap();
            let _ = create_new_job(&mut account, alice, 10000); //alice tạo job
            let _ = auction_job(&mut account, bob, 0, 97, 20);  //bob auction job
            let _ = create_contract(&mut account, alice, 20, 0, bob, 5, 2, 30000); //alice tạo hợp đồng
            // --------------------- check người kí hợp đồng -------------------------------------
            let charlie = default_accounts().charlie;
            let res = sign_contract_and_obtain(&mut account, charlie, 10, 0, 31000); //lúc charlie chưa đăng kí
            assert_eq!(res,Err(JobError::NotRegistered));
            let charlie = register_user_with_role_for(&mut account, "charlie", 'f').unwrap();
            let res = sign_contract_and_obtain(&mut account, charlie, 10, 0, 31000); //lúc charlie đăng kí làm freelancer
            assert_eq!(res,Err(JobError::NotPartyB));
            let res = sign_contract_and_obtain(&mut account, alice, 10, 0, 31000); //nếu alice hoặc owner khác kí hợp đồng
            assert_eq!(res,Err(JobError::NotFreelancer));
            // ---------------------- nếu bob gọi và không đủ balance => panic --------------------------------
            // set_balance(bob, 9); //balance của bob là 9
            // assert_eq!(get_balance_of(bob), 9);
            // let res = sign_contract_and_obtain(&mut account, bob, 10, 0, 31000);
            //----------------------- check thời gian quá hạn kí hợp đồng --------------------------
            // thời gian kí hơp đồng là (31 + 2*60*60)*1000 = 7231000
            let res = sign_contract_and_obtain(&mut account, bob, 10, 0, 7231000); 
            assert_eq!(res,Err(JobError::ConfirmationTimeExpires));
        }

        #[ink::test]
        fn test_submit_success() {
            let mut account = build_contract();
            let alice = register_user_with_role_for(&mut account, "alice", 'c').unwrap();
            let bob = register_user_with_role_for(&mut account, "bob", 'f').unwrap();
            let _ = create_new_job(&mut account, alice, 10000); //alice tạo job
            let _ = auction_job(&mut account, bob, 0, 97, 20);  //bob auction job
            let _ = create_contract(&mut account, alice, 20, 0, bob, 5, 2, 30000); //alice tạo hợp đồng
            let _ = sign_contract_and_obtain(&mut account, bob, 10, 0, 31000); //bob kí hợp đồng và nhận việc
            set_caller(bob);
            let _ = account.submit(0, "toi da hoan thanh cong viec".to_string());
            // -------------------check thông tin ----------------------
            // check thông tin job
            let job_0 = account.jobs.get(0).unwrap();
            assert_eq!(
                (
                    job_0.status,
                    job_0.result
                ),
                (
                    Status::REVIEW,
                    Some("toi da hoan thanh cong viec".to_string())
                )
            );
            // check owner_jobs
            let alice_jobs = account.owner_jobs.get(alice).unwrap();
            assert_eq!(alice_jobs, vec![(0, Status::REVIEW)]);
            // check freelancer_jobs
            let bob_jobs = account.freelancer_jobs.get(bob).unwrap();
            assert_eq!(bob_jobs, vec![(0, Status::REVIEW)]);
        }


        #[ink::test]
        fn test_submit_should_fail() {
            let mut account = build_contract();
            let alice = register_user_with_role_for(&mut account, "alice", 'c').unwrap();
            let bob = register_user_with_role_for(&mut account, "bob", 'f').unwrap();
            let _ = create_new_job(&mut account, alice, 10000); //alice tạo job
            let _ = auction_job(&mut account, bob, 0, 97, 20);  //bob auction job
            let _ = create_contract(&mut account, alice, 20, 0, bob, 5, 2, 30000); //alice tạo hợp đồng
            let _ = sign_contract_and_obtain(&mut account, bob, 10, 0, 31000); //bob kí hợp đồng và nhận việc
            //-------------------check người gọi ------------------------
            // charlie chưa đăng kí
            let charlie = default_accounts().charlie;
            let res = submit_job(&mut account, charlie, 0, 320000);
            assert_eq!(res, Err(JobError::NotRegistered));
            // charlie đã đăng kí 
            let charlie = register_user_with_role_for(&mut account, "charlie", 'f').unwrap();
            let res = submit_job(&mut account, charlie, 0, 320000);
            assert_eq!(res, Err(JobError::NotTakeThisJob));
            // một owner khác 
            let eve = register_user_with_role_for(&mut account, "eve", 'c').unwrap();
            let res = submit_job(&mut account, eve, 0, 320000);
            assert_eq!(res, Err(JobError::NotFreelancer)); 
            //-------------------tùy chỉnh status và test ---------------
            let mut job_0 = account.jobs.get(0).unwrap();
            for status in [Status::OPEN, Status::REOPEN, Status::AUCTIONING] {
                job_0.status = status;
                account.jobs.insert(0, &job_0);
                let res = submit_job(&mut account, bob, 0, 86410000); 
                assert_eq!(res, Err(JobError::NotTakeThisJob)); 
            }

            for status in [Status::REVIEW, Status::UNQUALIFIED] {
                job_0.status = status;
                account.jobs.insert(0, &job_0);
                let res = submit_job(&mut account, bob, 0, 86410000); 
                assert_eq!(res, Err(JobError::Submitted)); 
            }
           
            job_0.status = Status::FINISH;
            account.jobs.insert(0, &job_0);
            let res = submit_job(&mut account, bob, 0, 86410000); 
            assert_eq!(res, Err(JobError::Finished)); 

            job_0.status = Status::CANCELED;
            account.jobs.insert(0, &job_0);
            let res = submit_job(&mut account, bob, 0, 86410000); 
            assert_eq!(res, Err(JobError::Canceled)); 
            
            //------------------- check quá hạn -------------------------
            // hạn là 10 + 24 * 60 * 60  
            job_0.status = Status::DOING;
            account.jobs.insert(0, &job_0);
            let res = submit_job(&mut account, bob, 0, 86411000); //quá hạn 1s
            assert_eq!(res, Err(JobError::OutOfDate)); 
        }


        #[ink::test]
        fn test_reject_success() {
            let mut account = build_contract();
            let alice = register_user_with_role_for(&mut account, "alice", 'c').unwrap();
            let bob = register_user_with_role_for(&mut account, "bob", 'f').unwrap();
            let _ = create_new_job(&mut account, alice, 10000); //alice tạo job
            let _ = auction_job(&mut account, bob, 0, 97, 20);  //bob auction job
            let _ = create_contract(&mut account, alice, 20, 0, bob, 5, 2, 30000); //alice tạo hợp đồng
            let _ = sign_contract_and_obtain(&mut account, bob, 10, 0, 31000); //bob kí hợp đồng và nhận việc
            let _ = submit_job(&mut account, bob, 0, 32000); //bob submit công việc
            // reject kết quả 
            set_block_timestamp(33000);
            set_caller(alice);
            let res = account.reject(0,"ly do chua hai long voi cong viec nay".to_string());
            assert_eq!(res, Ok(()));
            // -------------------check thông tin ----------------------
            // check thông tin job
            let job_0 = account.jobs.get(0).unwrap();
            assert_eq!(
                (
                    job_0.status,
                    job_0.feedback
                ),
                (
                    Status::UNQUALIFIED,
                    "ly do chua hai long voi cong viec nay".to_string()
                )
            );
            // check owner_jobs
            let alice_jobs = account.owner_jobs.get(alice).unwrap();
            assert_eq!(alice_jobs, vec![(0, Status::UNQUALIFIED)]);
            // check freelancer_jobs
            let bob_jobs = account.freelancer_jobs.get(bob).unwrap();
            assert_eq!(bob_jobs, vec![(0, Status::UNQUALIFIED)]);
        }

        #[ink::test]
        fn test_reject_should_fail() {
            let mut account = build_contract();
            let alice = register_user_with_role_for(&mut account, "alice", 'c').unwrap();
            let bob = register_user_with_role_for(&mut account, "bob", 'f').unwrap();
            let _ = create_new_job(&mut account, alice, 10000); //alice tạo job
            let _ = auction_job(&mut account, bob, 0, 97, 20);  //bob auction job
            let _ = create_contract(&mut account, alice, 20, 0, bob, 5, 2, 30000); //alice tạo hợp đồng
            let _ = sign_contract_and_obtain(&mut account, bob, 10, 0, 31000); //bob kí hợp đồng và nhận việc
            let _ = submit_job(&mut account, bob, 0, 32000); //bob submit công việc
            //-------------------check người gọi ------------------------
            // charlie chưa đăng kí
            let charlie = default_accounts().charlie;
            let res = reject_job(&mut account, charlie, 0, 320000);
            assert_eq!(res, Err(JobError::NotRegistered));
            // charlie đã đăng kí 
            let charlie = register_user_with_role_for(&mut account, "charlie", 'f').unwrap();
            let res = reject_job(&mut account, charlie, 0, 320000);
            assert_eq!(res, Err(JobError::NotJobAssigner));
            // một owner khác 
            let eve = register_user_with_role_for(&mut account, "eve", 'c').unwrap();
            let res = reject_job(&mut account, eve, 0, 320000);
            assert_eq!(res, Err(JobError::NotAssignThisJob)); 
            //-------------------- check quá hạn ----------------------
            let res = reject_job(&mut account, alice, 0, 86410001);
            assert_eq!(res, Err(JobError::OutOfDate));
        }

        #[ink::test]
        fn test_approval_success() {
            let mut account = build_contract();
            let alice = register_user_with_role_for(&mut account, "alice", 'c').unwrap();
            let bob = register_user_with_role_for(&mut account, "bob", 'f').unwrap();
            let _ = create_new_job(&mut account, alice, 10000); //alice tạo job
            let _ = auction_job(&mut account, bob, 0, 97, 20);  //bob auction job
            let _ = create_contract(&mut account, alice, 20, 0, bob, 5, 2, 30000); //alice tạo hợp đồng
            let _ = sign_contract_and_obtain(&mut account, bob, 10, 0, 31000); //bob kí hợp đồng và nhận việc
            let _ = submit_job(&mut account, bob, 0, 32000); //bob submit công việc
            set_caller(alice);
            let res = account.approval(0);
            assert_eq!(res, Ok(()));
            // -------------------check thông tin ----------------------
            // check thông tin job
            let job_0 = account.jobs.get(0).unwrap();
            assert_eq!(job_0.status, Status::FINISH);
            // check owner_jobs
            let alice_jobs = account.owner_jobs.get(alice).unwrap();
            assert_eq!(alice_jobs, vec![(0, Status::FINISH)]);
            // check freelancer_jobs
            let bob_jobs = account.freelancer_jobs.get(bob).unwrap();
            assert_eq!(bob_jobs, vec![(0, Status::FINISH)]);
            // --------------------check balance --------------------
            assert_eq!(get_balance_of(account.env().account_id()), 3);
            assert_eq!(get_balance_of(alice), 100);
            assert_eq!(get_balance_of(bob), 297);
        }

        #[ink::test]
        fn test_approval_should_fail() {
            let mut account = build_contract();
            let alice = register_user_with_role_for(&mut account, "alice", 'c').unwrap();
            let bob = register_user_with_role_for(&mut account, "bob", 'f').unwrap();
            let _ = create_new_job(&mut account, alice, 10000); //alice tạo job
            let _ = auction_job(&mut account, bob, 0, 97, 20);  //bob auction job
            let _ = create_contract(&mut account, alice, 20, 0, bob, 5, 2, 30000); //alice tạo hợp đồng
            let _ = sign_contract_and_obtain(&mut account, bob, 10, 0, 31000); //bob kí hợp đồng và nhận việc
            let _ = submit_job(&mut account, bob, 0, 32000); //bob submit công việc
            // let res = approval(&mut account, alice, 0, 33000);
            // assert_eq!(res, Ok(()));
            //-------------------check người gọi ------------------------
            // charlie chưa đăng kí
            let charlie = default_accounts().charlie;
            let res = approval(&mut account, charlie, 0, 330000);
            assert_eq!(res, Err(JobError::NotRegistered));
            // charlie đã đăng kí 
            let charlie = register_user_with_role_for(&mut account, "charlie", 'f').unwrap();
            let res = approval(&mut account, charlie, 0, 330000);
            assert_eq!(res, Err(JobError::NotJobAssigner));
            // một owner khác 
            let eve = register_user_with_role_for(&mut account, "eve", 'c').unwrap();
            let res = approval(&mut account, eve, 0, 320000);
            assert_eq!(res, Err(JobError::NotAssignThisJob)); 
            //------------------- check quá hạn ---------------------
            let res = approval(&mut account, alice, 0, 86410001);
            assert_eq!(res, Err(JobError::OutOfDate));
        }
        

        #[ink::test]
        fn test_cancel_success() {
            let mut account = build_contract();
            let alice = register_user_with_role_for(&mut account, "alice", 'c').unwrap();
            let _ = create_new_job(&mut account, alice, 10000); //alice tạo job 0
            let _ = create_new_job(&mut account, alice, 10000); //alice tạo job 1
            let res = account.cancel(0);
            assert_eq!(res, Ok(()));
            set_block_timestamp(86410001);
            let res = account.cancel(1);
            assert_eq!(res, Ok(()));
            // check owner_jobs
            let alice_jobs = account.owner_jobs.get(alice).unwrap();
            assert_eq!(alice_jobs, vec![(0, Status::CANCELED), (1, Status::CANCELED)]);
        }

        #[ink::test]
        fn test_cancel_should_fail() {
            let mut account = build_contract();
            let alice = register_user_with_role_for(&mut account, "alice", 'c').unwrap();
            let bob = register_user_with_role_for(&mut account, "bob", 'f').unwrap();
            let _ = create_new_job(&mut account, alice, 10000); //alice tạo job
            let _ = auction_job(&mut account, bob, 0, 97, 20);  //bob auction job
            // ---------------------- alice hủy job --------------
            set_caller(alice);
            let res = account.cancel(0);
            assert_eq!(res, Err(JobError::Processing));
            // ---------------------------------------------------
            let _ = create_contract(&mut account, alice, 20, 0, bob, 5, 2, 30000); //alice tạo hợp đồng
            // ---------------------- alice hủy job --------------
            set_caller(alice);
            let res = account.cancel(0);
            assert_eq!(res, Err(JobError::Processing));
            // ---------------------------------------------------
            let _ = sign_contract_and_obtain(&mut account, bob, 10, 0, 31000); //bob kí hợp đồng và nhận việc
            // ---------------------- alice hủy job --------------
            set_caller(alice);
            let res = account.cancel(0);
            assert_eq!(res, Err(JobError::Processing));
            // ---------------------------------------------------
            let _ = submit_job(&mut account, bob, 0, 32000); //bob submit công việc
            // ---------------------- alice hủy job --------------
            set_caller(alice);
            let res = account.cancel(0);
            assert_eq!(res, Err(JobError::Processing));
            // ---------------------------------------------------
            let mut job_0 = account.jobs.get(0).unwrap();
            // ---------------------- alice hủy job canceled--------------
            job_0.status = Status::CANCELED;
            account.jobs.insert(0, &job_0);
            set_caller(alice);
            let res = account.cancel(0);
            assert_eq!(res, Err(JobError::Canceled));
            // -----------------------------------------------------------
            // ---------------------- alice hủy job finish--------------
            job_0.status = Status::FINISH;
            account.jobs.insert(0, &job_0);
            set_caller(alice);
            let res = account.cancel(0);
            assert_eq!(res, Err(JobError::Finished));
            // -----------------------------------------------------------
        }

        #[ink::test]
        fn test_request_negotiate_and_respond_negotiate_success() {
            let mut account = build_contract();
            let alice = register_user_with_role_for(&mut account, "alice", 'c').unwrap();
            let bob = register_user_with_role_for(&mut account, "bob", 'f').unwrap();
            let _ = create_new_job(&mut account, alice, 10000); //alice tạo job
            let _ = auction_job(&mut account, bob, 0, 97, 20);  //bob auction job
            let _ = create_contract(&mut account, alice, 20, 0, bob, 5, 2, 30000); //alice tạo hợp đồng
            let _ = sign_contract_and_obtain(&mut account, bob, 10, 0, 31000); //bob kí hợp đồng và nhận việc
            let _ = submit_job(&mut account, bob, 0, 32000); //bob submit công việc
            let _ = reject_job(&mut account, alice, 0, 33000); //alice reject công việc
            // ---------------------- bob yêu cầu thương lượng -----------------------
            set_caller(bob);
            let res = account.request_negotiate(0, "bob muon thuong luong cong viec nay".to_string(), 50);
            assert_eq!(res, Ok(()));
            // check thông tin 
            let job_0 = account.jobs.get(0).unwrap();
            assert_eq!(
                (
                    job_0.negotiation_pay,
                    job_0.feedback,
                    job_0.request_negotiation,
                    job_0.requester,
                ),
                (   
                    50,
                    "bob muon thuong luong cong viec nay".to_string(),
                    true,
                    Some(bob),
                )
            );
            // // ------------------------ alice trả lời: chấp nhận thương lượng-----------------------
            // set_caller(alice);
            // let res = account.respond_negotiate(0, true);
            // assert_eq!(res, Ok(()));
            // //check thông tin job
            // let job_0 = account.jobs.get(0).unwrap();
            // assert_eq!(job_0.status, Status::FINISH);
            // // check owner_jobs
            // let alice_jobs = account.owner_jobs.get(alice).unwrap();
            // assert_eq!(alice_jobs, vec![(0, Status::FINISH)]);
            // // check freelancer_jobs
            // let bob_jobs = account.freelancer_jobs.get(bob).unwrap();
            // assert_eq!(bob_jobs, vec![(0, Status::FINISH)]);
            // // check balance
            // assert_eq!(get_balance_of(account.env().account_id()), 3);
            // assert_eq!(get_balance_of(alice), 147);
            // assert_eq!(get_balance_of(bob), 250);
            // // --------------------------------------------------------------------------------
            // ------------------------ alice trả lời: không chấp nhận thương lượng-----------------------
            set_caller(alice);
            let res = account.respond_negotiate(0, false);
            assert_eq!(res, Ok(()));
            //check thông tin job
            let job_0 = account.jobs.get(0).unwrap();
            assert_eq!(job_0.status, Status::UNQUALIFIED);
            // check owner_jobs
            let alice_jobs = account.owner_jobs.get(alice).unwrap();
            assert_eq!(alice_jobs, vec![(0, Status::UNQUALIFIED)]);
            // check freelancer_jobs
            let bob_jobs = account.freelancer_jobs.get(bob).unwrap();
            assert_eq!(bob_jobs, vec![(0, Status::UNQUALIFIED)]);
            // check balance
            assert_eq!(get_balance_of(account.env().account_id()), 130);
            assert_eq!(get_balance_of(alice), 80);
            assert_eq!(get_balance_of(bob), 190);
            // ---------------------- alice yêu cầu thương lượng -----------------------
            set_caller(alice);
            let res = account.request_negotiate(0, "alice muon thuong luong lai cong viec nay".to_string(), 30);
            assert_eq!(res, Ok(()));
            // check thông tin 
            let job_0 = account.jobs.get(0).unwrap();
            assert_eq!(
                (
                    job_0.negotiation_pay,
                    job_0.feedback,
                    job_0.request_negotiation,
                    job_0.requester,
                ),
                (   
                    30,
                    "alice muon thuong luong lai cong viec nay".to_string(),
                    true,
                    Some(alice),
                )
            );
        }

        #[ink::test]
        fn test_request_negotiate_and_respond_negotiate_fail() {
            let mut account = build_contract();
            let alice = register_user_with_role_for(&mut account, "alice", 'c').unwrap();
            let bob = register_user_with_role_for(&mut account, "bob", 'f').unwrap();
            let _ = create_new_job(&mut account, alice, 10000); //alice tạo job
            let _ = auction_job(&mut account, bob, 0, 97, 20);  //bob auction job
            let _ = create_contract(&mut account, alice, 20, 0, bob, 5, 2, 30000); //alice tạo hợp đồng
            let _ = sign_contract_and_obtain(&mut account, bob, 10, 0, 31000); //bob kí hợp đồng và nhận việc
            let _ = submit_job(&mut account, bob, 0, 32000); //bob submit công việc
            let _ = reject_job(&mut account, alice, 0, 33000); //alice reject công việc
            //--------------- bob request fail ------------------
            let res = request_negotiate(&mut account, bob, 0, "django muon thuong luong".to_string(), 101);
            assert_eq!(res, Err(JobError::InvalidPayAmount));
            //--------------- tạo 3 account khác ------------------------
            let charlie = register_user_with_role_for(&mut account, "charlie", 'c').unwrap();
            let eve = register_user_with_role_for(&mut account, "eve", 'f').unwrap();
            let django = default_accounts().django;
            //--------------- django request ----------------------
            let res = request_negotiate(&mut account, django, 0, "django muon thuong luong".to_string(), 50);
            assert_eq!(res, Err(JobError::NotRegistered));
            //--------------- charlie request ----------------------
            let res = request_negotiate(&mut account, charlie, 0, "charlie muon thuong luong".to_string(), 50);
            assert_eq!(res, Err(JobError::NotAssignThisJob));
            //--------------- eve request ----------------------
            let res = request_negotiate(&mut account, eve, 0, "charlie muon thuong luong".to_string(), 50);
            assert_eq!(res, Err(JobError::NotTakeThisJob));
            // ------------- bob request thành công -------------------
            let res = request_negotiate(&mut account, bob, 0, "django muon thuong luong".to_string(), 50);
            assert_eq!(res, Ok(()));
            //--------------- django respond ----------------------
            let res = respond_negotiate(&mut account, django, 0, true);
            assert_eq!(res, Err(JobError::NotRegistered));
            //--------------- charlie respond ----------------------
            let res = respond_negotiate(&mut account, charlie, 0, true);
            assert_eq!(res, Err(JobError::NotAssignThisJob));
            //--------------- eve respond ----------------------
            let res = respond_negotiate(&mut account, eve, 0, true);
            assert_eq!(res, Err(JobError::NotAssignThisJob));
        }

        #[ink::test]
        fn test_terminate() {
            let mut account = build_contract();
            let alice = register_user_with_role_for(&mut account, "alice", 'c').unwrap();
            let bob = register_user_with_role_for(&mut account, "bob", 'f').unwrap();
            let _ = create_new_job(&mut account, alice, 10000); //alice tạo job
            let _ = auction_job(&mut account, bob, 0, 97, 20);  //bob auction job
            let _ = create_contract(&mut account, alice, 20, 0, bob, 5, 2, 30000); //alice tạo hợp đồng
            let _ = sign_contract_and_obtain(&mut account, bob, 10, 0, 31000); //bob kí hợp đồng và nhận việc
            let _ = submit_job(&mut account, bob, 0, 32000); //bob submit công việc
            let _ = reject_job(&mut account, alice, 0, 33000); //alice reject công việc
            // assert_eq!(get_balance_of(alice), 80);
            // assert_eq!(get_balance_of(bob), 190);
            // assert_eq!(get_balance_of(account.env().account_id()), 130);

            // ----------------------check người gọi ------------------------------
            let eve = register_user_with_role_for(&mut account, "eve", 'c').unwrap();
            set_caller(eve);
            let res = account.terminate(0);
            assert_eq!(res, Err(JobError::InvalidTermination));

            let charlie = register_user_with_role_for(&mut account, "charlie", 'f').unwrap();
            set_caller(charlie);
            let res = account.terminate(0);
            assert_eq!(res, Err(JobError::InvalidTermination));

            //-----------------------check status Open, Reopen, Acutioning, Cancel, Finish-----------------------
            for status in [Status::OPEN, Status::REOPEN, Status::AUCTIONING, Status::CANCELED, Status::FINISH] {
                set_job_status_and_end_time(&mut account, 0, status, 34000);
                //-------------------
                set_caller(alice);
                let res1 = account.terminate(0);
                assert_eq!(res1, Err(JobError::InvalidTermination));
                //-------------------
                set_caller(bob);
                let res1 = account.terminate(0);
                assert_eq!(res1, Err(JobError::InvalidTermination));
            }

            //--------------------check status DOING and Out Of Date----------------------------
            //--------------------chưa quá hạn
            set_job_status_and_end_time(&mut account, 0, Status::DOING, 86410000);  //chưa quá hạn
            //---------
            set_caller(alice);
            let res = account.terminate(0);
            assert_eq!(res, Err(JobError::Processing));
            //----------
            set_caller(bob);
            let res = account.terminate(0);
            assert_eq!(res, Err(JobError::Processing));
            //--------------------đã quá hạn
            set_job_status_and_end_time(&mut account, 0, Status::DOING, 86410001);  //đã quá hạn
            //---------
            // set_caller(alice);
            set_caller(bob);
            let res = account.terminate(0);
            assert_eq!(res, Ok(()));
            //---------- terminate rồi thì ko terminate được nữa
            // // set_caller(bob);
            // set_caller(alice);
            // let res = account.terminate(0);
            // assert_eq!(res, Ok(()));
            //---------- check balance 
            assert_eq!(get_balance_of(account.env().account_id()), 3);
            assert_eq!(get_balance_of(alice), 207);
            assert_eq!(get_balance_of(bob), 190);
            //-----------kiểm tra reporter---------
            assert_eq!(account.jobs.get(0).unwrap().reporter, Some(alice));

            //--------------------check status REVIEW and Out Of Date----------------------------
            //----set lại balance và reporter = None
            set_balance(alice, 80);
            set_balance(bob, 190);
            set_balance(account.env().account_id(), 130);
            let mut job_0 = account.jobs.get(0).unwrap();
            job_0.reporter = None;
            account.jobs.insert(0, &job_0);
            //--------------------chưa quá hạn
            set_job_status_and_end_time(&mut account, 0, Status::REVIEW
                , 86410000);  //chưa quá hạn
            //---------
            set_caller(alice);
            let res = account.terminate(0);
            assert_eq!(res, Err(JobError::Processing));
            //----------
            set_caller(bob);
            let res = account.terminate(0);
            assert_eq!(res, Err(JobError::Processing));
            //--------------------đã quá hạn
            set_job_status_and_end_time(&mut account, 0, Status::REVIEW, 86410001);  //đã quá hạn
            //---------
            // set_caller(alice);
            set_caller(bob);
            let res = account.terminate(0);
            assert_eq!(res, Ok(()));
            //---------- terminate rồi thì ko terminate được nữa
            // set_caller(bob);
            // // set_caller(alice);
            // let res = account.terminate(0);
            // assert_eq!(res, Ok(()));
            //---------- check balance 
            assert_eq!(get_balance_of(account.env().account_id()), 3);
            assert_eq!(get_balance_of(alice), 173);
            assert_eq!(get_balance_of(bob), 224);
            assert_eq!(account.jobs.get(0).unwrap().reporter, Some(bob));

            //--------------------check status UNQUALIFIED and Out Of Date----------------------------
            //----set lại balance
            set_balance(alice, 80);
            set_balance(bob, 190);
            set_balance(account.env().account_id(), 130);
            //--------------------chưa quá hạn
            set_job_status_and_end_time(&mut account, 0, Status::UNQUALIFIED, 86410000);  //chưa quá hạn
            //---------
            set_caller(alice);
            let res = account.terminate(0);
            assert_eq!(res, Ok(()));
            //----------
            // set_caller(bob);
            // let res = account.terminate(0);
            // assert_eq!(res, Ok(()));
            //---------- check balance 
            assert_eq!(get_balance_of(account.env().account_id()), 3);
            assert_eq!(get_balance_of(alice), 193);
            assert_eq!(get_balance_of(bob), 204);
        }

        
        fn set_job_to_check_report_and_rating(contract: &mut Account, job_id: JobId, owner: AccountId, freelancer: AccountId, reporter: AccountId, require_rating: (bool, bool)){
            let job = Job{
                name: "job it 1".to_string(),
                job_id: job_id,
                description: "job detail".to_string(),
                category: Category::IT,
                result: Some("ket qua".to_string()),
                status: Status::FINISH,
                budget: 91,
                fee_percentage: 3,
                start_time: 10000,
                end_time: 86410000,
                person_create: Some(owner),
                person_obtain: Some(freelancer),
                pay: 97,
                negotiation_pay : 0, 
                feedback: String::new(), 
                request_negotiation: false,
                requester: None,
                reporter: Some(reporter),
                require_rating: require_rating,
                unqualifier: false,
                required_deposit_of_owner: 10,
                required_deposit_of_freelancer: 20,
            };
            contract.jobs.insert(job_id, &job);
        }

        #[ink::test]
        fn test_report() {
            let mut account = build_contract();
            let alice = register_user_with_role_for(&mut account, "alice", 'c').unwrap();
            let bob = register_user_with_role_for(&mut account, "bob", 'f').unwrap();
            //--------------- alice report -------------------
            set_job_to_check_report_and_rating(&mut account, 0, alice, bob, alice, (false, false));
            set_job_to_check_report_and_rating(&mut account, 2, alice, bob, alice, (false, false));
            set_caller(alice);
            let _ = account.report(0, "Toi khong hai long".to_string());
            assert_eq!(account.reports.get(bob).unwrap(), vec![(0 as u128, Some("Toi khong hai long".to_string()))]);
            let _ = account.report(2, "Toi khong hai long".to_string());
            assert_eq!(account.reports.get(bob).unwrap(), vec![(0 as u128, Some("Toi khong hai long".to_string())), (2 as u128, Some("Toi khong hai long".to_string()))]);
            //--------------- alice report lại -------------------
            set_caller(alice);
            let res = account.report(0, "Toi khong hai long".to_string());
            assert_eq!(res, Err(JobError::InvalidReport));
            //--------------- bob report -------------------
            set_caller(bob);
            let res = account.report(0, "Toi khong hai long".to_string());
            assert_eq!(res, Err(JobError::InvalidReport));
            //--------------- bob report job 1 -------------------
            set_job_to_check_report_and_rating(&mut account, 1, alice, bob, alice, (false, false));
            set_caller(bob);
            let res = account.report(0, "Toi khong hai long".to_string());
            assert_eq!(res, Err(JobError::InvalidReport));
            //--------------- eve report job 1 -------------------
            let eve = default_accounts().eve;
            let _ = register_owner(&mut account, eve);
            // let _ = register_freelancer(&mut account, eve);
            set_caller(eve);
            let res = account.report(0, "Toi khong hai long".to_string());
            assert_eq!(res, Err(JobError::InvalidReport));
        }

        #[ink::test]
        fn test_rating() {
            let mut account = build_contract();
            let alice = register_user_with_role_for(&mut account, "alice", 'c').unwrap();
            let bob = register_user_with_role_for(&mut account, "bob", 'f').unwrap();
            // ---------------------------TH1--------------------------
            set_job_to_check_report_and_rating(&mut account, 0, alice, bob, alice, (false, false));
            // set_caller(alice);
            set_caller(bob);
            let res = account.rating(0, 4);
            assert_eq!(res, Err(JobError::InvalidRating));
            // ---------------------------TH2--------------------------
            set_job_to_check_report_and_rating(&mut account, 0, alice, bob, alice, (true, false));
            //---------------------
            set_caller(alice);
            let res = account.rating(0, 3);
            assert_eq!(res, Ok(()));
            assert_eq!(account.ratings.get(alice), Some(vec![(0,Some(RatingPoint::ThreeStars))]));
            assert_eq!(account.ratings.get(bob), None);
            assert_eq!(account.personal_account_info.get(bob).unwrap().rating_points, (3, 1));
            assert_eq!(account.personal_account_info.get(alice).unwrap().rating_points, (0, 0));
            //---------------------
            set_caller(bob);
            let res = account.rating(0, 4);
            assert_eq!(res, Err(JobError::InvalidRating));
            // ---------------------------TH3--------------------------
            set_job_to_check_report_and_rating(&mut account, 0, alice, bob, alice, (false, true));
            //---------------------
            set_caller(alice);
            let res = account.rating(0, 4);
            assert_eq!(res, Err(JobError::InvalidRating));
            //---------------------
            set_caller(bob);
            let res = account.rating(0, 4);
            assert_eq!(res, Ok(()));
            assert_eq!(account.ratings.get(bob), Some(vec![(0,Some(RatingPoint::FourStars))]));
            assert_eq!(account.personal_account_info.get(bob).unwrap().rating_points, (3, 1));
            assert_eq!(account.personal_account_info.get(alice).unwrap().rating_points, (4, 1));
            // ---------------------------TH4--------------------------
            set_job_to_check_report_and_rating(&mut account, 1, alice, bob, alice, (true, true));
            set_caller(alice);
            let _ = account.rating(1, 5);
            set_caller(bob);
            let _ = account.rating(1, 5);
            assert_eq!(account.ratings.get(alice), Some(vec![
                (0,Some(RatingPoint::ThreeStars)),
                (1,Some(RatingPoint::FiveStars))
            ]));
            assert_eq!(account.ratings.get(bob), Some(vec![
                (0,Some(RatingPoint::FourStars)),
                (1,Some(RatingPoint::FiveStars))
            ]));
            assert_eq!(account.personal_account_info.get(bob).unwrap().rating_points, (8, 2));
            assert_eq!(account.personal_account_info.get(alice).unwrap().rating_points, (9, 2));
        }
    }
}
