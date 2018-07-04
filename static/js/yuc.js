const contributeAddress = document.querySelector("#contribute-addres");

contributeAddress.onclick = function() {
  document.execCommand("copy");
}

contributeAddress.addEventListener("copy", function(event) {
  event.preventDefault();
  if (event.clipboardData) {
    event.clipboardData.setData("text/plain", contributeAddress.textContent);
  }
});

function decodeStats(response, price) {
    if (response == null) return null;

    var result = response.result;
    if (result == null || result.length == null || result.length < 193) return null;

    var weiPerEther = new BigNumber("1000000000000000000", 10);

    var totalContributionExact = new BigNumber(result.substr(2, 64), 16).div(weiPerEther);
    var totalContributionUSDExact = totalContributionExact.times(new BigNumber(price));

    return {
        purchasingAllowed: !(new BigNumber(result.substr(194, 64), 16).isZero()),
        totalContribution: totalContributionExact.round(3, BigNumber.ROUND_DOWN),
        totalContributionUSD: totalContributionUSDExact.round(0, BigNumber.ROUND_DOWN),
        totalContributionRents: totalContributionUSDExact.div(new BigNumber("3258")).round(0, BigNumber.ROUND_DOWN),
        totalIssued: new BigNumber(result.substr(66, 64), 16).div(weiPerEther).round(3, BigNumber.ROUND_DOWN),
        totalBonusTokensIssued: new BigNumber(result.substr(130, 64), 16).div(weiPerEther).round(3, BigNumber.ROUND_DOWN)
    };
}

function getStats(price) {
    var url = "https://api-rinkeby.etherscan.io/api?module=proxy&action=eth_call&to=0x1c8bd0a27bbae94db0673e78dfb26ffc823c1268&data=0xc59d48470000000000000000000000000000000000000000000000000000000000000000&tag=latest";
    return $.ajax(url, {
        cache: false,
        dataType: "json"
    }).then(function (data) {
        return decodeStats(data, price);
    });
}

function getPrice() {
    var url = "https://api.etherscan.io/api?module=stats&action=ethprice";
    return $.ajax(url, {
        cache: false,
        dataType: "json"
    }).then(function (data) {
        if (data == null) return null;
        if (data.result == null) return null;
        if (data.result.ethusd == null) return null;

        return parseFloat(data.result.ethusd);
    });
}

function updatePage(stats) {
    if (stats == null) return;

    const totalContribution = stats.totalContribution.toNumber();
    const totalContributionUSD = stats.totalContributionUSD.toNumber()
    const totalContributionRents = stats.totalContributionRents.toNumber();
    const totalBonusTokensIssued = stats.totalBonusTokensIssued.toNumber()

    $("#total-ether").text(stats.totalContribution.toFixed(3));
    if (totalContribution <= 0) {
        $("#total-ether-message").text("My internet is slow today.");
    } else {
        $("#total-ether-message").text("All the way to Blockchain 3.0");
    }

    $("#total-usd").text("$" + stats.totalContributionUSD.toFixed(0));
    if (totalContributionUSD <= 0) {
        $("#total-usd-message").text("No Ether yet, so no cash either.");
    } else if (totalContributionRents < 1) {
        $("#total-usd-message").text("Not enough to buy one month rent in the bay area omg.");
    }else if (totalContributionRents < 2) {
        $("#total-usd-message").text("Enough to survive a month in bay area.");
    } else {
        $("#total-usd-message").text("Enough to pay " + stats.totalContributionRents.toFixed(0) + " months rent!");
    }

    $("#total-tokens").text(stats.totalIssued.toFixed(3));
    if (stats.totalIssued <= 0) {
        $("#total-tokens-message").text("No YUC issued yet.");
    } else if (totalBonusTokensIssued <= 0) {
        $("#total-tokens-message").text("Look at all Lambos!");
    } else {
        $("#total-tokens-message").text("Including " + stats.totalBonusTokensIssued.toFixed(3) + " bonus tokens!");
    }

    if (stats.purchasingAllowed) {
        $(".puchasing-allowed").show();
        $(".puchasing-finished").hide();
    } else {
        $(".puchasing-allowed").hide();
        $(".puchasing-finished").show();
    }

    $("#stats").show();
}

function refresh() { getPrice().then(getStats).then(updatePage); }

$(function() {
    try {
        refresh();
        setInterval(refresh, 1000 * 60 * 5);
    } catch (err) { }
});
