(function () {
    var initial_deposit = document.querySelector('#initial_deposit'),
        contribution_amount = document.querySelector('#contribution_amount'),
        investment_timespan = document.querySelector('#investment_timespan'),
        investment_timespan_text = document.querySelector('#investment_timespan_text'),
        estimated_return = document.querySelector('#estimated_return'),
        future_balance = document.querySelector('#future_balance');

    function updateValue(element, action) {
        var min = parseFloat(element.getAttribute('min')),
            max = parseFloat(element.getAttribute('max')),
            step = parseFloat(element.getAttribute('step')) || 1,
            oldValue = element.dataset.value || element.defaultValue || 0,
            newValue = parseFloat(element.value.replace(/\€/, ''));

        if (isNaN(parseFloat(newValue))) {
            newValue = oldValue;
        } else {
            if (action == 'add') {
                newValue += step;
            } else if (action == 'sub') {
                newValue -= step;
            }

            newValue = newValue < min ? min : newValue > max ? max : newValue;
        }

        element.dataset.value = newValue;
        element.value = (element.dataset.prepend || '') + newValue + (element.dataset.append || '');

        updateChart();
    }

    function getChartData() {
        var P = parseFloat(initial_deposit.dataset.value), // Principal
            r = parseFloat(estimated_return.dataset.value / 100), // Annual Interest Rate
            c = parseFloat(contribution_amount.dataset.value), // Contribution Amount
            n = 365 // parseInt(document.querySelector('[name="compound_period"]:checked').value), // Compound Period
            n2 = parseInt(document.querySelector('[name="contribution_period"]:checked').value), // Contribution Period
            t = parseInt(investment_timespan.value), // Investment Time Span
            currentYear = (new Date()).getFullYear()
            ;

        var labels = [];
        for (var year = currentYear; year < currentYear + t; year++) {
            labels.push(year);
        }

        var principal_dataset = {
            label: 'Total Principal',
            backgroundColor: '#1d4ed8', // '#8300e9',
            data: []
        };

        var interest_dataset = {
            label: "Total Interest",
            backgroundColor: '#33ff57',
            data: []
        };

        for (var i = 1; i <= t; i++) {
            var principal = P + ( c * n2 * i ),
                interest = 0,
                balance = principal;

            if (r) {
                var x = Math.pow(1 + r / n, n * i),
                    compound_interest = P * x,
                    contribution_interest = c * (x - 1) / (r / n2);
                interest = (compound_interest + contribution_interest - principal).toFixed(0)
                balance = (compound_interest + contribution_interest).toFixed(0);
            }

            future_balance.innerHTML = '€' + balance;
            principal_dataset.data.push(principal);
            interest_dataset.data.push(interest);
        }

        return {
            labels: labels,
            datasets: [principal_dataset, interest_dataset],
            
        }
    }

    function updateChart() {
        var data = getChartData();

        chart.data.labels = data.labels;
        chart.data.datasets[0].data = data.datasets[0].data;
        chart.data.datasets[1].data = data.datasets[1].data;
        chart.update();
    }

    initial_deposit.addEventListener('change', function () {
        updateValue(this);
    });

    contribution_amount.addEventListener('change', function () {
        updateValue(this);
    });

    estimated_return.addEventListener('change', function () {
        updateValue(this);
    });

    investment_timespan.addEventListener('change', function () {
        investment_timespan_text.innerHTML = this.value + ' years';
        updateChart();
    });

    investment_timespan.addEventListener('input', function () {
        investment_timespan_text.innerHTML = this.value + ' years';
    });

    var radios = document.querySelectorAll('[name="contribution_period"], [name="compound_period"]');
    for (var j = 0; j < radios.length; j++) {
        radios[j].addEventListener('change', updateChart);
    }

    var buttons = document.querySelectorAll('[data-counter]');
    for (var i = 0; i < buttons.length; i++) {
        var button = buttons[i];

        button.addEventListener('click', function () {
            var field = document.querySelector('[name="' + this.dataset.field + '"]'),
                action = this.dataset.counter;

            if (field) {
                updateValue(field, action);
            }
        });
    }

    Chart.defaults.global.defaultFontFamily='"Inter",sans-serif';
    Chart.defaults.global.defaultFontColor="#000";
    Chart.defaults.global.defaultFontSize=18;
    var ctx = document.getElementById('myChart').getContext('2d'),
        chart = new Chart(ctx, {
            type: 'bar',
            data: getChartData(),
            options: {
                legend: {
                    display: false,
                },
                tooltips: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function (tooltipItem, data) {
                            return data.datasets[tooltipItem.datasetIndex].label + ': €' + tooltipItem.yLabel;
                        }
                    }
                },
                responsive: true,
                scales: {
                    xAxes: [{
                        stacked: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Year'
                        }
                    }],
                    yAxes: [{
                        stacked: true,
                        ticks: {
                            callback: function (value) {
                                return '€' + value;
                            }
                        },
                        scaleLabel: {
                            display: true,
                            labelString: 'Balance'
                        }
                    }]
                }
            }
        });

})();
