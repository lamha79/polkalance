# Polkalance

Polkalance is a decentralized job marketplace built on Substrate and ink!. The platform allows users to post and find jobs securely and transparently.

## Features

* **Post and find jobs:** Users can post jobs or find jobs by position, skills, salary, etc.
* **Direct payment:** Workers will receive their salary directly to their Substrate wallet.
* **Transparency:** All transactions are recorded on the blockchain, ensuring transparency and immutability.

## How to use

To use Polkalance, you need a Substrate wallet. Once you have a wallet, you can visit the Polkalance website and log in with your wallet.

To post a job, you need to provide the following information:

* Job name
* Job description
* Salary
* Duration
* Category

To find a job, you can use filters to find jobs that match your needs.

# Polkalance: Freelancer smart contract in *Substrate node*

Polkalance is a freelancing platform in Polkadot developed [ink!](https://github.com/paritytech/ink) programing language with [Substrate](https://substrate.io).  

- Platform for freelancers, employers and businesses
- Intergrate power of blockchain
- Built on Polkadot

## Architecture of smart contract

```mermaid

classDiagram
  class Account{
  +Mapping~JobId~ jobs
  +JobId current_job_id
  +Mapping~AccountId~ personal_account_info
  +Mapping~AccountId~ owner_jobs
  +Mapping~AccountId~ freelancer_jobs
  +Mapping~(AccountId,AccountId,JobId)~ successful_jobs
  +Mapping~(AccountId,AccountId,JobId)~ unsuccesful_jobs
}

class Job{
  +String name
  +String description
  +Option~String~ result
  +Status status
  +Balance budget
  +u8 fee_percentage
  +Timestamp start_time
  +Timestamp end_time
  +Option~AccountId~ person_create
  +Option~AccountId~ person_obtain
  +String feedback
  +bool request_negotiation
  +bool require_rating
}

  class Status {
    + DOING
    + REVIEW
    + UNQUALIFIED
    + REOPEN
    + FINISH
    + CANCELED   
  }

  class JobError {    
    + Registered, //đã đăng kí tài khoản (đăng kí), không đăng kí nữa
    + NotRegistered, // chưa đăng kí tài khoản.
    + NotJobAssigner, // bạn không phải là người giao việc
    + NotFreelancer, // bạn không phải là freelancer
    + CreatedJob, //Job đã tạo
    + NotExisted, // Job không tồn tại
    + NotTaked, // chưa có người nhận job
    + Taked, //đã có người nhận
    + NotTakeThisJob, // bạn ko có nhận job này
    + NotAssignThisJob, //bạn ko phải là người giao việc này
    + Submited, //đã submit 
    + Proccesing, //đang có người làm
    + CurrentJobIncomplete, //hoàn thành job hiện tại đã
    + JobInvalid,
    + Finish, //job đã hoàn thành    
    + InvalidPayAmount // số tiền thanh toán không hợp lệ
    + AlreadyRequestNegotiation // đã yêu cầu thương lượng
  }

  class JobId {
    + id : String
    + new(id: String) : JobId
    + to_string() : String
  }

  class AccountId {
    + id : String
    + new(id: String) : AccountId
    + to_string() : String
  }

  class AccountRole {
    + ENTERPRISE
    + INVIDUAL
    + FREELANCER
    + is_owner_job() : bool
    + is_freelancer() : bool
    + is_team_leader() : bool
  }

  class RatingPoint {
    + value : u32
    + new(value: u32) : RatingPoint
    + to_string() : String
  }

  class CompletedJob {
    + job_id : JobId
    + feedback : String
    + new(job_id: JobId, feedback: String) : CompletedJob
  }

  class Balance {
    + amount : u64
    + new(amount: u64) : Balance
    + to_string() : String
  }

  class Dapp {
    + user : User
    + createJob(jobID: JobId): Result // Updated method signature
    + cancleJob(jobID: JobId): Result // Updated method signature
    + createTeam(Map<String, String>): Result
    + addMember(userId: AccountID): Result
    + removeMember(userID: AccountID): Result
    + displayOpenJobs() : void
    + obtainJob(jobId: JobId) : void
    + submitJobResult(jobId: JobId, result: String) : void
    + rejectJob(jobId: JobId) : void
    + approveJob(jobId: JobId) : void
    + getFreelancerAccountType() : AccountType
  }

  Dapp -- AccountRole
  AccountRole -- Account
  Account -- Balance
  Account --* Job
  Account -- JobId
  Account -- AccountId
  Account -- RatingPoint
  Account -- CompletedJob
  JobError -- Job
  Job -- Status


```

## How it works

```mermaid
flowchart TB
    A[Client creates job] --> B[Job status<br>OPEN]
    B -- Freelancer takes job --> D[Job status<br>DOING]
    D -- Deadline timeout --> H
    D -- Submit success --> E[Job status<br>REVIEW]
    E -- Terminate --> K
    E -- Done --> G[Job status<br>FINISH]
    E -- Reject --> H[Job status<br>UNQUALIFIED]
    H -- Resubmit --> E
    H -- Terminate --> K
    H -- Request Negotiate --> I{Negotiate} 
    I -- Success --> G
    I -- Terminate --> K[Report]
    B -- Cancle job --> M[Refund client<br>Job status<br>CANCELED]
    J -- Cancle job --> M
    J -- Freelancer take job --> D
    K -- Success--> J[Job status<br>REOPEN] 
    
```

## Download

Polkalance is currently in development. You can download the source code from [GitHub](https://github.com/lamha/polkalance).

## Documentation

<!-- Polkalance documentation is available on [GitHub](https://github.com//polkalance/tree/main/docs). -->

## Join the community

<!-- You can join the Polkalance community on [Discord](https://discord.gg/) or [Twitter](https://twitter.com/). -->

## Thank you

Thank you for your interest in Polkalance!
