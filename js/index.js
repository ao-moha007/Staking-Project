//import { notyf } from 'notyf';
//FUNCTION CALL
let countDownGlobal = null; // Define globally
loadInitialData("sevenDays");
connectMe("metamask_wallet");


function connectWallet() { }


function openTab(event, name) {
    console.log("tab name : ", name);
    contractCall = name;
    getSelectedTab(name);
    loadInitialData(name);
}


async function loadInitialData(sClass) {
    console.log("loadInitialData starting : ", sClass);


    oContractToken = await getContractTokenObj(sClass);
    console.log("test web3 : ", oContractToken);
    try {
        try {
            if (typeof countDownGlobal !== 'undefined') {
                clearInterval(countDownGlobal);
            }
            // Logic for loading data
        } catch (error) {
            console.error(error);
        }
        //console.log("loading successful 1");
        let cObj = new web3Main.eth.Contract(
            SELECT_CONTRACT[_NETWORK_ID].STACKING.abi,
            SELECT_CONTRACT[_NETWORK_ID].STACKING[sClass].address);

        //ID ELEMENT DATA
        let totalUsers = await cObj.methods.getTotalUsers().call();
        let cApy = await cObj.methods.getAPY().call();
        console.log("cApy", cApy);

        //GET USER
        console.log("currentAddress", currentAddress);
        let userDetail = await cObj.methods.getUser(currentAddress).call();
        const user = {
            lastRewardCalculationTime: userDetail.lastRewardCalculationTime,
            lastStakeTime: userDetail.lastStakeTime,
            rewardAmount: userDetail.rewardAmount,
            rewardsClaimedSoFar: userDetail.rewardsClaimedSoFar,
            stakeAmount: userDetail.stakeAmount,
            address: currentAddress
        };
        localStorage.setItem("User", JSON.stringify(user));
        let userDetailBal = userDetail.stakeAmount / 10 ** 18;
        document.getElementById(
            "total-locked-user-token"
        ).innerHTML = `${userDetailBal}`;
        console.log("userDetailBal", userDetailBal);

        //ELEMENTS --ID
        document.getElementById(
            "num-of-stakers-value"
        ).innerHTML = `${totalUsers}`;
        document.getElementById("apy-value-feature").innerHTML = `${cApy} %`;

        //CLASS ELEMENT DATA
        let totalLockedTokens = await cObj.methods.getTotalStakedTokens().call();
        let earlyUnstakeFee = await cObj.methods
            .getEarlyUnstakeFeePercentage()
            .call();

        //ELEMENTS --CLASS
        document.getElementById("total-locked-tokens-value").innerHTML = `${totalLockedTokens / 10 ** 18} ${SELECT_CONTRACT[_NETWORK_ID].TOKEN.symbol} `;
        document
            .querySelectorAll("early-unstake-fee-value")
            .forEach(function (element) {
                element.innerHTML = `${earlyUnstakeFee / 100}%`;
            });
        let minStakeAmount = await cObj.methods.getMinimumStakingAmount().call(); //getMaxStakingTokenLimit
        let maxStakeAmount = await cObj.methods.getMaxStakingTokenLimit().call();
        minStakeAmount = Number(minStakeAmount);
        maxStakeAmount = Number(maxStakeAmount);
        let minA;
        let maxA;
        if (minStakeAmount) {
            console.log("minStakeAmount", (minStakeAmount / 10 ** 18).toLocaleString());

            minA = `${(minStakeAmount / 10 ** 18).toLocaleString()} ${SELECT_CONTRACT[_NETWORK_ID].TOKEN.symbol}`;
        } else {
            minA = "N/A";
        }
        if (maxStakeAmount) {

            console.log("maxStakeAmount", (maxStakeAmount / 10 ** 18).toLocaleString());
            maxA = `${(maxStakeAmount / 10 ** 18).toLocaleString()} ${SELECT_CONTRACT[_NETWORK_ID].TOKEN.symbol}`;
        } else {
            maxA = `${(10000000).toLocaleString()} ${SELECT_CONTRACT[_NETWORK_ID].TOKEN.symbol}`;//"N/A";
        }
        document
            .querySelectorAll(".Minimum-Staking-Amount")
            .forEach(function (element) {
                element.innerHTML = `${minA}`;
            });

        document
            .querySelectorAll(".Maximum-Staking-Amount")
            .forEach(function (element) {
                element.innerHTML = `${maxA}`;
            });
        let isStakingPaused = await cObj.methods.getStakingStatus().call();
        console.log("isStakingPaused : ", isStakingPaused);
        let isStakingPausedText;
        let startDate = await cObj.methods.getStartDate().call();
        startDate = Number(startDate) * 1000;
        let endDate = await cObj.methods.getStakeEndDate().call();

        endDate = Number(endDate) * 1000;
        let stakeDays = await cObj.methods.getStakeDays().call();
        let days = Math.floor(Number(stakeDays) / (3600 * 24));
        let dayDisplay = days > 0 ? days + (days = 1 ? " day " : " days ") : "";
        document.querySelectorAll(".Lock-period-value").forEach(function (element) {
            element.innerHTML = `${dayDisplay}`;
        });
        let rewardBal = await cObj.methods
            .getUserEstimatedRewards()
            .call({ from: currentAddress });
        document.getElementById("user-reward-balance-value").value = `${rewardBal / 10 ** 18}   ${SELECT_CONTRACT[_NETWORK_ID].TOKEN.symbol}`;

        //USER TOKEN BALANCE
        let balMainUser;
        try {
            console.log("currentAddress:", currentAddress);

            console.log("oContractToken:", oContractToken);

            console.log("oContractToken methods :", oContractToken.methods);

            if (oContractToken && currentAddress) {

                balMainUser = currentAddress
                    ? await oContractToken.methods.balanceOf(currentAddress).call() : "";

                balMainUser = Number(balMainUser) / 10 ** 18;

                console.log("User token balance:", balMainUser);
            } else {
                console.error("oContractToken or currentAddress is not defined.");
            }
        } catch (error) {
            console.error("Error fetching balance:", error);
        }
        document.getElementById(
            "user-token-balance"
        ).innerHTML = `Balance  : ${balMainUser}`;
        let currentDate = new Date().getTime();
        if (isStakingPaused) {
            isStakingPausedText = "Paused";
        } else if (currentDate < startDate) {
            isStakingPausedText = "Locked";
        } else if (currentDate > endDate) {
            isStakingPausedText = "Ended";
        } else {
            isStakingPausedText = "Active";
        }
        console.log("isStakingPausedText:", isStakingPausedText);
        document
            .querySelectorAll(".active-status-staking")
            .forEach(function (element) {
                element.innerHTML = `${isStakingPausedText}`;
            });
        if (currentDate > startDate && currentDate < endDate) {
            const ele = document.getElementById("countdown-time-value");
            generateCountDown(ele, endDate);
            document.getElementById(
                "countdown-title-value"
            ).innerHTML = `Staking Ends In`;
            document.querySelectorAll("#apy-value-here").forEach(function (element) {
                element.innerHTML = `${cApy} %`;
            });
        }
        console.log("warning : ",currentDate,"",currentDate);
        
        
        if (currentDate < startDate) {
            console.log("enter the apy");
            //document.getElementById("apy-value-here").innerHTML = "25 %" ; //`${cApy} %`;
            const ele = document.getElementById("countdown-time-value");
            generateCountDown(ele, endDate);
            document.getElementById(
                "countdown-title-value"
            ).innerTML = 'Staking Starts In';
            
            document.querySelectorAll("#apy-value-here").forEach(function (element) {
                element.innerHTML = `${cApy} %`;
            });
        }
        
        console.log("loading successful end");
    }
    catch (error) {
        console.log(error);
        notyf.error(
            `Unable to fetch data from ${SELECT_CONTRACT[_NETWORK_ID].network_name}!\n Please
                refersh this page.`
        );
    }
}

//------CONTDOWN
function generateCountDown(ele, claimDate) {
    clearInterval(countDownGlobal);
    // Set the date we're counting down to
    var countDownDate = new Date(claimDate).getTime();
    // Update the count down every 1 second
    countDownGlobal = setInterval(function () {
        // Get today's date and time
        var now = new Date().getTime();
        // Find the distance between now and the count down date

        var distance = countDownDate - now;
        //console.log("distance : ",distance,"countDownDate : ",countDownDate,"now : ",now);
        // Time calculations for days, hours, minutes and seconds
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);
        // Display the result in the element with id="demo"
        //console.log(days + "d" + hours + "h" + minutes + "m " + seconds + "s ");
        ele.innerHTML = days + "d" + hours + "h" + minutes + "m " + seconds + "s ";

        // ele.html(days + "d" + hours + "h" + minutes + "m " + seconds + "s ");

        // If the count down is finished, write some text
        if (distance < 0) {
            clearInterval(countDownGlobal);
            ele.innerHTML = "Refresh Page";
        }
    }, 1000);
}
async function connectMe(_provider) {
    try {
        let _comn_res = await commonProviderDetector(_provider);
        console.log(_comn_res);
        if (!_comn_res) {
            console.log("Please Connect");
        } else {
            let sClass = getSelectedTab();
            console.log(sClass);
        }
    } catch (error) {
        notyf.error(error.message);
    }
}
async function stackTokens() {
    try {
        let nTokens = document.getElementById("amount-to-stake-value-new").value;
        if (!nTokens) {
            return;
        }
        if (isNaN(nTokens) || nTokens == 0 || Number(nTokens) < 0) {
            console.log(`Invalid token amount!`);
            return;
        }
        nTokens = Number(nTokens);
        let tokenToTransfer = addDecimal(nTokens, 18);
        console.log("tokenToTransfer", tokenToTransfer);
        let oContractToken = await getContractTokenObj("sevenDays");
        console.log("oContractToken", oContractToken);
        let balMainUser = await oContractToken.methods.balanceOf(currentAddress).call();
        balMainUser = Number(balMainUser) / 10 ** 18;
        console.log("balMainUser", balMainUser);

        if (balMainUser < nTokens) {
            notyf.error(
                `insufficient tokens on ${SELECT_CONTRACT[_NETWORK_ID].network_name}. \nPlease
                         buy some tokens first!`
            );
            return;
        }
        let sClass = getSelectedTab(contractCall);
        console.log("stacking test of sClass", sClass);
        console.log("stacking test of STACKING[sClass] : ", SELECT_CONTRACT[_NETWORK_ID].STACKING[sClass].address);
        let balMainAllowance = await oContractToken.methods
            .allowance(
                currentAddress,
                SELECT_CONTRACT[_NETWORK_ID].STACKING[sClass].address
            )
            .call();
        if (Number(balMainAllowance) < Number(tokenToTransfer)) {
            console.log("balMainAllowance : " ,balMainAllowance,"tokenToTransfer",tokenToTransfer);
            approveTokenSpend(tokenToTransfer, sClass);
            console.log("approveTokenSpend call from  stackTokens function");
        } else {
            stackTokenMain(tokenToTransfer, sClass);
            console.log("stackTokenMain call from  stackTokens function");
        }
    } catch (error) {
        console.log(error);
        //notyf.dismiss(notification);
        notyf.error(formatEthErrorMsg(error));
    }
}
async function approveTokenSpend(_mint_fee_wei, sClass) {
    let gasEstimation;
    try {
        gasEstimation = await oContractToken.methods
            .approve(
                SELECT_CONTRACT[_NETWORK_ID].STACKING[sClass].address,
                _mint_fee_wei
            )
            .estimateGas({
                from: currentAddress,
            });
    }

    catch (error) {
        console.log(error);
        notyf.error(formatEthErrorMsg(error));
        return;
    }

    oContractToken.methods
        .approve(
            SELECT_CONTRACT[_NETWORK_ID].STACKING[sClass].address,
            _mint_fee_wei

        )
        .send({
            from: currentAddress,
            gas: gasEstimation,
        })
        .on("transactionHash", (hash) => {
            console.log("Transaction Hash: ", hash);
        })
        .on("receipt", (receipt) => {
            console.log(receipt);

            stackTokenMain(_mint_fee_wei,sClass);
            console.log("stackTokenMain call from  approveTokenSpend function");
        })
        .catch((error) => {
            console.log(error);
            notyf.error(formatEthErrorMsg(error));
            return;
        });
}

async function stackTokenMain(_amount_wei, sClass) {
    let gasEstimation;
    let oContractStacking;
    let withdrawableAmount;
    
    try {
        console.log("sClass from stackTokenMain : ",sClass);
         oContractStacking = await getContractObj(sClass);
    } catch (error) {
        console.error("Error getting contract object:", error);
    }

    //console.log("oContractStacking address : ", oContractStacking.address);
    console.log("oContractStacking methods : ", oContractStacking.methods);

    console.log("Stake property:", oContractStacking.methods.stake);
    try {
        let amountStaking = web3.utils.toWei(_amount_wei, "ether");
        console.log("amountStaking : ", amountStaking);
        console.log("amountStaking in ether : ", _amount_wei / 10 ** 18);

        //preparation for the function stake 
        try{
            if (typeof oContractStacking.methods.owner === 'function') {
                console.log("The owner() method exists.");
            } else {
                console.log("The owner() method does not exist.");
            }
            oContractStacking.methods.getwithdrawableAmount().call()
            .then(withdrawableAmount => {
                console.log("withdrawableAmount Amount:", withdrawableAmount);
            })
            .catch(error => {
                console.error("Error fetching owner amount:", error);
            });
            
    }
        catch(error){
            console.error("the error is here",error)
        }
        if (Number(withdrawableAmount) < _amount_wei ) {
            console.error("Not enough withdrawable tokens.");
            return;
        }

        
        //end of preparation
        try{
        const gasEstimation = await oContractStacking.methods.stake(_amount_wei).estimateGas({
            from: currentAddress,
        });}catch(error){console.error("gas error : ", error);}
        console.log("Estimated Gas:", gasEstimation);

        // gasEstimation = await oContractStacking.methods
        //     .stake(_amount_wei)
        //     .estimateGas({
        //         from: currentAddress,
        //     });
    }
    catch (error) {
        console.log("error in stake function : ", error);
        //notyf.error(formatEthErrorMsg(error));
        return;
    }
    oContractStacking.methods
        .stake(_amount_wei)
        .send({
            from: currentAddress,
            gas: gasEstimation,
        })
        .on("receipt", (receipt) => {
            console.log(receipt);
            const receiptObj = {
                token: _amount_wel,
                from: receipt.from,
                to: receipt.to,
                blockHash: receipt.blockHash,
                blockNumber: receipt.blockNumber,
                cumulativeGasUsed: receipt.cumulativeGasUsed,
                effectiveGasPrice: receipt.effectiveGasPrice,
                gasUsed: receipt.gasUsed,
                status: receipt.status,
                transactionHash: receipt.transactionHash,
                type: receipt.type,
            };
            let transactionHistory = [];
            const allUserTransaction = localStorage.getItem("transactions");
            if (allUserTransaction) {
                transactionHistory = JSON.parse(localStorage.getItem("transactions"));
                transactionHistory.push(receiptobj);
                localStorage.setItem(
                    "transactions",
                    JSON.stringify(transactionHistory)
                );
            } else {
                transactionHistory.push(receiptObj);
                localStorage.setItem(
                    "transactions",
                    JSON.stringify(transactionHistory)
                );
            }

            console.log(allUserTransaction);
            window.location.href = "http://127.0.0.1:5500/analytic.html";
        })
        .on("transactionHash", (hash) => {
            console.log("Transaction Hash: ", hash);
        })
        .catch((error) => {
            console.log("staking error : ",error);
            notyf.error(formatEthErrorMsg(error));
            return;
        });
}

async function unstackTokens() {
    try {
        let nTokens = document.getElementById("amount-to-unstake-value").value;
        if (!nTokens) {
            return;
        }
        if (isNaN(nTokens) || nTokens == 0 || Number(nTokens) < 0) {
            notyf.error(`Invalid token amount!`);
            return;
        }
        nTokens = Number(nTokens);
        let tokenToTransfer = addDecimal(nTokens, 18);
        console.log("tokenToTransfer : ",tokenToTransfer);
        let sClass = getSelectedTab(contractCall);
        console.log("sClass : ",sClass);
        let oContractStacking = await getContractObj(sClass);
        console.log("oContractStacking : ",oContractStacking);
        let balMainUser = await oContractStacking.methods.getUser(currentAddress).call();
        balMainUser = Number(balMainUser.stakeAmount) / 10 ** 18;
        if (balMainUser < nTokens) {
            notyr.error(
                `insufficient staked tokens on $(SELECT_CONTRACT[_NETWORK_ID].network_name)!`
            );
            return;
        }
        unstackTokenMain(tokenToTransfer, oContractStacking, sClass);
    } catch (error) {
        console.log(error);
        notyf.dismiss(notification);
        notyf.error(formatEthErrorMsg(error));
    }
}

async function unstackTokenMain(_amount_wei, oContractStacking, sClass) {
    let gasestimation;
    try {
        console.log("oContractStacking 2 : ",oContractStacking);
        gasEstimation = await oContractStacking.methods
            .unStake(_amount_wei)
            .estimateGas({
                from: currentAddress,
            });
    } catch (error) {
        console.log(error);
        notyf.error(formatEthErrorMsg(error));
        return;
    }
    oContractStacking.methods
        .unStake(_amount_wei)
        .send({
            from: currentAddress,
            gas: gasEstimation,
        })
        .on("receipt", (receipt) => {
            console.log(receipt);
            const receiptobj = {
                token: _amount_wei,
                from: receipt.from,
                to: receipt.to,
                blockHash: receipt.blockHash,
                blockNumber: receipt.blockNumber,
                cumulativeGasUsed: receipt.cumulativeGasUsed,
                effectiveGasPrice: receipt.effectiveGasPrice,
                gasUsed: receipt.gasUsed,
                status: receipt.status,
                transactionHash: receipt.transactionHash,
                type: receipt.type,
            };
            let transactionHistory = [];
            const allUserTransaction = localStorage.getItem("transactions");
            if (allUserTransaction) {
                transactionHistory = JSON.parse(localStorage.getItem("transactions"));
                transactionHistory.push(receiptobj);
                LocalStorage.setItem
                "transactions",
                    JSON.stringify(transactionHistory)
            } else {
                transactionHistory.push(receiptobj);
                localStorage.setItem(
                    "transactions",
                    JSON.stringify(transactionHistory)
                );
            }
            window.location.href = "http://127.0.0.1:5500/analytic.html";
        })
        .on("transactionHash", (hash) => {
            console.log("Transaction Hash:", hash);
        })
        .catch((error) => {
            console.log(error);
            notyf.error(formatEthErrorMsg(error));
            return;
        });
}

async function claimTokens() {
    try {
        let sClass = getSelectedTab(contractCall);
        let oContractStacking = await getContractObj(sClass);
        let rewardBal = await oContractStacking.methods
            .getUserEstimatedRewards()
            .call({ from: currentAddress });
        rewardBal = Number(rewardBal);
        console.log("rewardBal", rewardBal);
        if (!rewardBal) {
            notyf.dismiss(notification);
            notyf.error('insufficient reward tokens to claim!');
            return;
        }
        claimTokenMain(oContractStacking, sClass);
    } catch (error) {
        console.log(error);
        notyf.dismiss(notification);
        notyf.error(formatEthErrorMsg(error));
    }
}

async function claimTokenMain(oContractStacking, sClass) {
    let gasEstimation;
    try {
        gasEstimation = await oContractStacking.methods.claimReward().estimateGas({
            from: currentAddress,
        });
        console.log("gasEstimation", gasEstimation);
    } catch (error) {
        console.log(error);
        notyf.error(formatEthErrorMsg(error));
        return;
    }
    oContractStacking.methods
        .claimReward()
        .send({
            from: currentAddress,
            gas: gasEstimation,
        })
        .on("receipt", (receipt) => {
            console.log(receipt);
            const receiptobj = {
                from: receipt.from,
                to: receipt.to,
                blockHash: receipt.blockHash,
                blockNumber: receipt.blockNumber,
                cumulativegasUsed: receipt.cumulativegasused,
                effectivegasPrice: receipt.effectiveGasPrice,
                gasUsed: receipt.gasUsed,
                status: receipt.status,
                transactionHash: receipt.transactionHash,
                type: receipt.type,
            };
            let transactionHistory = [];
            const allUserTransaction = localStorage.getItem("transactions");
            if (allUserTransaction) {
                transactionHistory = JSON.parse(localStorage.getItem("transactions"));
                transactionHistory.push(receiptObj);
                localStorage.setItem(
                    "transactions",
                    JSON.stringify(transactionHistory)
                );
            } else {
                transactionHistory.push(receiptobj);
                localStorage.setItem(
                    "transactions",
                    JSON.stringify(transactionHistory)
                );
            }
            window.location.href = "http://127.0.0.1:5500/analytic.html";
        })
        .on("transactionHash", (hash) => {
            console.log("Transaction Hash: ", hash);
        })
        .catch((error) => {
            console.log(error);
            notyf.error(formatEthErrorMsg(error));
            return;
        });
}

