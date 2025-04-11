const userTransaction = JSON.parse(localStorage.getItem("transactions"));
const User = JSON.parse(localStorage.getItem("User"));

console.log("userTransaction",userTransaction);
console.log("User",User);

function generateCountDown(targetTime){
  const now = new Date().getTime(); // Current time in milliseconds
  const distance = now - targetTime ; // Difference between target and now
  console.log("now : ", now);
  if (distance < 0) {
      return "Countdown finished";
  }

    
    var minutes = Math.floor((distance % (1000*60*60))/(1000*60));
    console.log("minutes  : ", minutes);
    var seconds = Math.floor((distance % (1000*60))/1000);
    console.log("seconds : ", seconds);
    return minutes + "m" + seconds + "s";

}
console.log("generateCountDown type 1 : ",typeof generateCountDown, generateCountDown(User.lastRewardCalculationTime));
console.log("generateCountDown type 2 : ",typeof generateCountDown, generateCountDown(User.lastStakeTime));
console.log("lastRewardCalculationTime : ",User.lastRewardCalculationTime );
console.log("lastStakeTime : ",User.lastStakeTime );


const contractTransactionList = document.querySelector(".dataUserTransactionNew");
const UserProfile = document.querySelector(".contract-user");

//CARD
  const userTransactionHistory = userTransaction.map((transaction,i)=>{
    return `
    <div class="col-12 col-md-6 col-lg-4 item explore-item" data-groups='["ongoing","ended"]' >
    <div class="card project-card">
      <div class="media d-flex">
        <a href="project-details.html">
          <img src="assets/img/content/thumb_${i+1}.png" alt="" class="card-img-top avatar-max-lg">
        </a>
        <div class="mediia-body ml-4">
          <a href="project-details.html">
            <h4 class="m-0">#tbCoders</h4>
          </a>
          <div class="contdown-times">
            <h6 class="my2">Transaction N0: ${i+1}</h6>
            <div class="countdown d-flex" data-date="2022-06-30"></div>
          </div>
        </div>
       
      </div>
      <div class="card-body">
        <div class="items ">
          <div class="single-item">
            <span>
            ${transaction.token ? "Amount" : "Claim Token"}
            </span>
            <span>${transaction.token ? transaction.token / 10 ** 18 :  " " }</span>
          </div>
          <div class="single-item">
            <span>Gas</span>
            <span>${transaction.gasUsed}</span>
          </div>
          <div class="single-item">
            <span>Status</span>
            <span>${transaction.status}</span>
          </div>
        </div>
      </div>
      <div class="project-footer d-flex align-items-center mt-4 mt-md-5">
        <a  target="_blank"  class="btn btn-bordered-white btn-smaller" href="https://polygonscan.com/tx/${transaction.transactionHash}" >
          Transaction</a>

          <div class="social-share mi-auto">
            <ul class="d-flex list-unstyled">
              <li>
                <a href="#">
                  <i class="fab fa-twitter"></i>
                </a>
              </li>
            </ul>
          </div>
          <div class="social-share mi-auto">
            <ul class="d-flex list-unstyled">
              <li>
                <a href="#">
                  <i class="fab fa-telegram"></i>
                </a>
              </li>
            </ul>
          </div>
          <div class="social-share mi-auto">
            <ul class="d-flex list-unstyled">
              <li>
                <a href="#">
                  <i class="fab fa-globe"></i>
                </a>
              </li>
            </ul>
          </div>
          <div class="social-share mi-auto">
            <ul class="d-flex list-unstyled">
              <li>
                <a href="#">
                  <i class="fab fa-discord"></i>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div class="blockchain-icon">
          <img src="assets/img/content/ethereum.png" alt="">
        </div>
    </div>
  </div>
    
    `;
}); 


//USER
const userProfileHTML = `
<div class="contract-user-profile">
<img src="assets/img/content/team_1.png" alt="" />
<div class="contract-user-profile-info">
  <p><strong>Address :</strong>
  ${User.address ? User.address.slice(0, 25) : 'N/A'}

  
  </p>
  <span class="contract-space">
    <strong>stakeAmount:</strong>
    ${User.stakeAmount / 10 ** 18 }
  </span>
  <span class="contract-space">
    <strong>lastRewardCalculationTime:</strong>
    ${generateCountDown(User.lastRewardCalculationTime)}
  </span>
  <span class="contract-space">
    <strong>lastStakeTime:</strong>
    ${generateCountDown(User.lastStakeTime)}
  </span>
  <span class="contract-space">
    <strong>rewardAmount:</strong>
    ${User.rewardAmount / 10 ** 18 }
  </span>
  <span class="contract-space">
    <strong>rewardsClaimedSoFar:</strong>
    ${User.rewardsClaimedSoFar / 10 ** 18 }
  </span>
  <p class="contract-paragraph">
    
  </p>
</div>

</div>

`;

UserProfile.innerHTML = userProfileHTML;
contractTransactionList.innerHTML = userTransactionHistory ; 
  
