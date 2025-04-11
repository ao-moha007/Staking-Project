
//let web3; // Declare web3 globally


async function commonProviderDetector(_provider) {

    if (_provider == "metamask_wallet") {
        if (window.ethereum && window.ethereum.providers) {
            const metamaskProvider = window.ethereum.providers.find(
                (provider) => provider.isMetaMask
            );
            if (metamaskProvider) {
                window.ethereum.providers = [metamaskProvider];
                return await commonInjectedConnect(metamaskProvider, _provider);
            } else {
                console.log("metamask wallet not found");
                window.open("https://metamask.io/download/", "_blank").focus();
                return false;
            }
        } else if (window.ethereum) {
            return await commonInjectedConnect(window.ethereum, _provider);
        } else {
            console.log("metamask wallet not found");
            try {
                window.open("https://metamask.io/download/", "_blank").focus();

            } catch (error) {

            }
            return false;
        }
    }
}

async function commonInjectedConnect(_provider, _provider_name) {
    await _provider.enable();
    setWeb3Events(_provider);
    web3 = new Web3(_provider);
    console.log("original web3",web3);
    // Get connected chain id from Ethereum node
    let currentNetworkId = await web3.eth.getChainId();
    currentNetworkId = currentNetworkId.toString();
    console.log("network", currentNetworkId);
    const accounts = await web3.eth.getAccounts();
    console.log("→> accounts");
    console.log(accounts);
    currentAddress = accounts[0].toLowerCase();
    if (currentNetworkId != _NETWORK_ID) {
        notyf.error(`Please connect Wallet on ${SELECT_CONTRACT[_NETWORK_ID].network_name}!`
        );
        return false;
    }

    ContractToken = new web3.eth.Contract(
        SELECT_CONTRACT[_NETWORK_ID].TOKEN.abi,
        SELECT_CONTRACT[_NETWORK_ID].TOKEN.address
    );
    return true;
}


function setWeb3Events(_provider) {
    _provider.on("accountsChanged", (accounts) => {
        console.log(accounts);
        if (!accounts.length) {
            logout();
        }
        else {
            currentAddress = accounts[0];
            let sClass = getSelectedTab();
        }
    });

    // Subscribe to chainId change
    _provider.on("chainChanged", (chainId) => {
        console.log(chainId);
        logout();
    });

    // Subscribe to session connection
    _provider.on("connect", () => {
        console.log("connect");
        logout();
    });

    // Subscribe to session disconnection
    _provider.on("disconnect", (code, reason) => {
        console.log(code, reason);
        localStorage.clear();
        logout();
    });
}

function logout() {
    window.location.reload();

}

function addDecimal(num, nDec) {
    const aNum = `${num}`.split(".");
    if (aNum[1]) {
        if (aNum[1].length > nDec) aNum[1].slice(0, nDec);
        return aNum[0] + aNum[1] + "0".repeat(nDec - aNum[1].length);
    }
    return aNum[0] + "0".repeat(nDec);
}

function formatEthErrorMsg(error) {
    try {
        var eFrom = error.message.indexOf("{");
        var eTo = error.message.lastIndexOf("}");
        var eM1 = error.message.indexOf("TokenStaking:");
        var eM2 = error.message.indexOf("ERC20 : ");
        var eMA = error.message.indexOf("Internal jSON-RPC error");
        if (eFrom != -1 && eTo != -1 && (eM1 != -1 || eM2 != -1)) {
            var eMsgTemp = JSON.parse(error.message.substr(eFrom, eTo));
            var eMsg = eMA != -1 ? eMsgTemp.message : eMsgTemp.originaError.message;
            if (eM1 != -1) {
                return eMsg.split("TokenStaking: ")[1];
            }
            else {
                return eMsg.split("ERC20 : ")[1];
            }
        }
        else {
            return error.message;
        }
    }
    catch (e) {
        console.log(e);
        return "Something Went Wrong!";
    }
}



function getSelectedTab(sClass) {
    console.log(sClass);
    return sClass || contractCall;
}


//////////////////////////////////////


// async function initializeWeb3() {
//     if (typeof window.ethereum !== 'undefined') {
//         const provider = window.ethereum;
//         await provider.enable();  // Enable the provider
//         web3 = new Web3(provider);  // Initialize Web3

//         // Optionally set Web3 events (e.g., account change, network change)
//         setWeb3Events(provider);
//     } else {
//         console.error("Ethereum provider not available.");
//     }
// }

async function getContractObj(sClass) {
    if (!web3) {
        console.error("Web3 was not initialized.");
        const provider = window.ethereum;
        await provider.enable();  // Enable the provider
        web3 = new Web3(provider);  // Initialize Web3
        // Initialize Web3 when the page loads
        // return;
         //initializeWeb3();
        
    }

    console.log("web3 instance : ", web3);

    // Ensure SELECT_CONTRACT[_NETWORK_ID] and the contract address exist
    const contractData = SELECT_CONTRACT[_NETWORK_ID].STACKING;
    console.log("contractData : ", contractData,"contractData[sClass]  : ",contractData[sClass] ,"contractData[sClass].address : ",contractData[sClass].address);
    if (!contractData || !contractData[sClass] || !contractData[sClass].address) {
        console.error("Invalid contract data or address.");
        return;
    }
    console.log("testing the getContract function for staking : ", contractData.abi);
    // Create contract object using web3
    return new web3.eth.Contract(
        SELECT_CONTRACT[_NETWORK_ID].STACKING.abi,
        SELECT_CONTRACT[_NETWORK_ID].STACKING[sClass].address
    );
}



async function getContractTokenObj(sClass) {
    if (!web3) {
        console.log("Web3 was not initialized.");
        const provider = window.ethereum;
        await provider.enable();  // Enable the provider
        web3 = new Web3(provider);  // Initialize Web3
        // Initialize Web3 when the page loads
        // return;
         //initializeWeb3();
        
    }

    console.log("web3 instance : ", SELECT_CONTRACT[_NETWORK_ID].TOKEN.address);
    
    
    return new web3.eth.Contract(
        SELECT_CONTRACT[_NETWORK_ID].TOKEN.abi,
        SELECT_CONTRACT[_NETWORK_ID].TOKEN.address
    );
}