class Timer {
    constructor(timerDiv) {
        this.timerDiv = timerDiv;
        this.interval = null;
        this.hours = 0;
        this.minutes = 0;
        this.seconds = 0;
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.hideTimerDiv();
        })
    }



    start() {
        if (!this.interval) {
            this.interval = setInterval(() => this.update(), 1000);
        }
    }

    stop() {
        clearInterval(this.interval);
        this.interval = null;
    }

    reset() {
        this.hours = 0;
        this.minutes = 0;
        this.seconds = 0;
        this.updateDisplay();
    }

    update() {
        this.seconds++;
        if (this.seconds >= 60) {
            this.minutes++;
            this.seconds = 0;
        }
        if (this.minutes >= 60) {
            this.hours++;
            this.minutes = 0;
        }
        this.updateDisplay();
    }

    updateDisplay() {
        this.timerDiv.innerText = `${this.hours < 10 ? '0' : ''}${this.hours}:${this.minutes < 10 ? '0' : ''}${this.minutes}:${this.seconds < 10 ? '0' : ''}${this.seconds}`;
    }
}


class CountdownTimer {
    constructor(countDownDiv, duration) {
        this.countDownDiv = countDownDiv;
        this.duration = duration;
        this.remainingTime = duration;
        this.interval = null;
        this.updateDisplay();
    }

    start() {
        if (!this.interval) {
            this.interval = setInterval(() => this.update(), 1000);
        }
    }

    stop() {
        clearInterval(this.interval);
        this.interval = null;
    }

    reset() {
        this.remainingTime = this.duration;
        this.updateDisplay();
    }

    update() {
        this.remainingTime--;
        if (this.remainingTime < 0) {
            this.stop();
            this.remainingTime = 0;
        }
        this.updateDisplay();
    }

    updateDisplay() {
        this.countDownDiv.style.fontSize = 'xx-large';
        this.countDownDiv.style.fontWeight = '800';
        this.countDownDiv.style.border = '1.5px';
        this.countDownDiv.style.borderStyle = 'groove';
        this.countDownDiv.style.borderColor = '008aff';
        const seconds = this.remainingTime % 60;
        this.countDownDiv.innerText = (seconds < 10 ? '0' : '') + seconds;
        if (this.remainingTime < 10) {
            this.countDownDiv.style.color = 'red';
        }
    }
}

class TeamSelectionUI {
    constructor(sHomeTeam, sAwayTeam, imgHome, imgAway) {
        this.selectHomeTeam = sHomeTeam;
        this.selectAwayTeam = sAwayTeam;
        this.imageLogoHome = imgHome;
        this.imageLogoAway = imgAway;
    }


    setupTeams() {

        this.selectHomeTeam.addEventListener('change', () => this.setImageLogo(this.selectHomeTeam, this.imageLogoHome, 'homelogo'));
        this.selectAwayTeam.addEventListener('change', () => this.setImageLogo(this.selectAwayTeam, this.imageLogoAway, 'awaylogo'));

        this.selectHomeTeam.addEventListener('change', () => this.makeKickOffBtnEnabled(this.selectHomeTeam, this.selectAwayTeam));
        this.selectAwayTeam.addEventListener('change', () => this.makeKickOffBtnEnabled(this.selectHomeTeam, this.selectAwayTeam));

        this.selectHomeTeam.addEventListener('change', () => this.removeTeamFromList(this.selectHomeTeam, this.selectAwayTeam));
        this.selectAwayTeam.addEventListener('change', () => this.removeTeamFromList(this.selectAwayTeam, this.selectHomeTeam));

        this.selectHomeTeam.addEventListener('change', () => this.storeSelectedTeamInnerText(this.selectHomeTeam, '.a'));
        this.selectAwayTeam.addEventListener('change', () => this.storeSelectedTeamInnerText(this.selectAwayTeam, '.b'));

        this.selectHomeTeam.addEventListener('change', () => this.storeSelectedTeamInnerText(this.selectHomeTeam, '.t1s'));
        this.selectAwayTeam.addEventListener('change', () => this.storeSelectedTeamInnerText(this.selectAwayTeam, '.t2s'));

    }

    setImageLogo(selectATeam, teamsImage, imageClass) {
        const selectedTeam = selectATeam.value;
        const imagePath = 'assets/'; // Update with the correct path

        teamsImage.innerHTML = '';

        if (selectedTeam !== 'none') {
            const img = document.createElement('img');
            img.className = imageClass;
            img.src = `${imagePath}${selectedTeam}.jpg`;
            img.style.cssText = 'width: 300px; height: 200px; margin: 20px;';
            teamsImage.appendChild(img);
            img.style.borderColor = '#112233';
            img.style.borderStyle = 'solid';
            img.style.borderRadius = '2px';
            img.style.boxShadow = '0 px 4 px 8 px rgba(0, 0, 0, 0.2)';

            teamsImage.style.display = 'block';
        } else {
            teamsImage.style.display = 'none';
        }
    }

    storeSelectedTeamInnerText = (selectedTeam, cName) => {
        let teamText = selectedTeam.value.toString();

        if (teamText.length > 14) {
            teamText = teamText.slice(0, 14);
            teamText = teamText.slice(0, -1) + '.'
        }

        document.querySelector(cName).innerText = teamText;
    }


    removeTeamFromList(selected, otherList) {
        let truncated;
        for (let i = 0; i < otherList.options.length; i++) {
            if (otherList.options[i].value === selected.value) {
                truncated = otherList.options[i];
                otherList.remove(i);
                break;
            }
        }
        selected.addEventListener('change', () => {
            if (truncated) otherList.add(truncated);
        });
    }

    makeKickOffBtnEnabled(selectHome, selectAway) {
        const kickOff = document.querySelector('.kick-off');
        kickOff.disabled = !(selectHome.value !== 'none' && selectAway.value !== 'none');
    }
}


class VolleyballMatch {
    constructor() {
        this.wonSetsA = 0;
        this.wonSetsB = 0;
        this.totalPointsA = 0;
        this.totalPointsB = 0;

        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            const timeContainer = document.getElementById('timer');
            const countDownContainer = document.getElementById('cd-timer');
            this.timer = new Timer(timeContainer);
            this.countDownTimer = new CountdownTimer(countDownContainer, 60);
            this.hideDiv(timeContainer);
            this.hideDiv(countDownContainer);
            this.hideDiv(document.querySelector('.scoreCounter'));
            this.hideDiv(document.querySelector('.match'));
            this.hideDiv(document.querySelector('.kick-off'));
            document.getElementById('download-results').disabled = true;
            const selectHome = document.getElementById('hteam');
            const selectAway = document.getElementById('ateam');
            const imageLogoHome = document.querySelector('.home-logo');
            const imageLogoAway = document.querySelector('.away-logo');


            this.dayOfTheMatch();
            this.disableButtons();
            this.teamsUI = new TeamSelectionUI(selectHome, selectAway, imageLogoHome, imageLogoAway);
            this.teamsUI.setupTeams();
            this.setupKickOff();
            this.setupTimeOut();
            this.disableOtherSets();
            this.scoreCount();
            this.winnerOfTheSet();

        });
    }

    conditionalDisplayMatchScoreTable() {
        const dayOfWeekSelect = document.getElementById('day-o-w');
        const matchDaySelect = document.getElementById('match-day');
        const matchDiv = document.querySelector('.match');
        const kickOffBtn = document.querySelector('.kick-off');

        if (dayOfWeekSelect.value !== '0' && matchDaySelect.value !== '0') {
            matchDiv.style.display = 'flex';
            kickOffBtn.style.display = 'inline-block';
            dayOfWeekSelect.disabled = true;
            matchDaySelect.disabled = true;

        } else {
            matchDiv.style.display = 'none';
            kickOffBtn.style.display = 'none';
        }
    }

    dayOfTheMatch() {
        document.getElementById('day-o-w').addEventListener('change', () => this.conditionalDisplayMatchScoreTable());
        document.getElementById('match-day').addEventListener('change', () => this.conditionalDisplayMatchScoreTable());
    }


    setTimeoutButtonDisability(clicked, notClicked) {

        clicked.addEventListener('click', () => {
            clicked.disabled = true;

            notClicked.disabled = false;
        })
    }

    hideDiv(aDiv) {
        aDiv.style.display = 'none';
    }



    setupKickOff() {
        const kickOff = document.querySelector('.kick-off');
        const timeoutBtn1 = document.querySelector('.timeout-a');
        const timeoutBtn2 = document.querySelector('.timeout-b');
        const addScoreToHomeTeam = document.querySelector('.increase-a-score');
        const addScoreToAwayTeam = document.querySelector('.increase-b-score');
        kickOff.disabled = true;


        kickOff.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('timer').style.display = 'block';
            this.timer.start();
            this.disableKickOff();
            this.disableOtherTeam();
            timeoutBtn1.disabled = false;
            timeoutBtn2.disabled = false;
            addScoreToHomeTeam.disabled = false;
            addScoreToAwayTeam.disabled = false;
            this.serviceDivInit();
            document.querySelector('.scoreCounter').style.display = 'block';


        });
    }

    disableKickOff() {
        const kickOff = document.querySelector('.kick-off');
        kickOff.disabled = true;
        kickOff.style.background = 'linear-gradient(300deg, #00bfff, #ff4c68, #ef8172)';
        kickOff.innerText = 'The match has started!';
        kickOff.style.fontSize = 'x-large';
        kickOff.style.fontWeight = '900';
        kickOff.style.border = 'none';
    }

    disableButtons() {
        const timeoutBtn1 = document.querySelector('.timeout-a');
        const timeoutBtn2 = document.querySelector('.timeout-b');
        const addScoreToHomeTeam = document.querySelector('.increase-a-score');
        const addScoreToAwayTeam = document.querySelector('.increase-b-score');


        timeoutBtn1.disabled = true;
        timeoutBtn2.disabled = true;
        addScoreToHomeTeam.disabled = true;
        addScoreToAwayTeam.disabled = true;
    }

    setupTimeOut() {

        const timeoutBtn1 = document.querySelector('.timeout-a');
        const timeoutBtn2 = document.querySelector('.timeout-b');
        const selectHomeTeam = document.getElementById('hteam');
        const selectAwayTeam = document.getElementById('ateam');
        const currSet = document.getElementById('currentSet');
        var i = 0;
        var j = 0;

        timeoutBtn1.addEventListener('click', () => this.callTimeOut(selectHomeTeam.value));
        timeoutBtn1.addEventListener('click', () => {
            timeoutBtn1.disabled = true;
            timeoutBtn1.innerText = `Available once ${currSet.value} is done`;

            // console.log(timeoutBtn1.innerText);
            i++;

            if (document.querySelector('.service-div')) {


                // console.log(document.querySelector('.service-div').innerText);
                this.hideDiv(document.querySelector('.service-div'));
            }

            if (timeoutBtn2.disabled == false) {
                timeoutBtn2.disabled = true;


                setTimeout(() => {
                    timeoutBtn2.disabled = false;
                }, 3000);
            }

        });

        timeoutBtn2.addEventListener('click', () => this.callTimeOut(selectAwayTeam.value));
        timeoutBtn2.addEventListener('click', () => {
            timeoutBtn2.disabled = true;
            timeoutBtn2.innerText = `Available once ${currSet.value} is done`;
            j++;

            if (document.querySelector('.service-div')) {


                // console.log(document.querySelector('.service-div').innerText);
                this.hideDiv(document.querySelector('.service-div'));
            }

            if (timeoutBtn1.disabled == false) {
                timeoutBtn1.disabled = true;

                setTimeout(() => {
                    timeoutBtn1.disabled = false;

                }, 3000);
            }
        });

    }

    callTimeOut(team) {
        this.timer.stop();

        if (this.timer.seconds > 0) {

            const teamsTimeOut = document.createElement('teamRequestedTimeOut');
            teamsTimeOut.innerText = `${team} has requested a Time Out, the game will be resumed in`;
            teamsTimeOut.className = 'teamsTime';
            teamsTimeOut.style.display = 'flex';
            teamsTimeOut.style.justifyContent = 'center';
            teamsTimeOut.style.margin = '1vh';
            teamsTimeOut.style.padding = '2vh';
            teamsTimeOut.style.fontSize = '2.5vh';
            teamsTimeOut.style.fontWeight = 800;
            teamsTimeOut.style.backgroundColor = 'linear-gradient(300deg, rgb(242, 220, 147), #008aff, rgb(242, 220, 147))';
            teamsTimeOut.style.fontFamily = `'SquareFont', Times, serif;`;


            teamsTimeOut.style.border = '0.6 vh solid';
            teamsTimeOut.style.borderColor = 'linear-gradient(300deg, rgb(242, 220, 147), #008aff, rgb(242, 220, 147))';
            teamsTimeOut.style.borderStyle = 'groove';


            const setStats = document.querySelector('.currentSetStats');
            const cdTimer = document.getElementById('cd-timer');
            const cdTimerWrap = document.querySelector('.cd-wrapper');
            setStats.insertBefore(teamsTimeOut, cdTimerWrap);

            cdTimer.style.display = 'block';

            this.countDownTimer.start();

            const addScoreToHomeTeam = document.querySelector('.increase-a-score');
            const addScoreToAwayTeam = document.querySelector('.increase-b-score');

            addScoreToHomeTeam.disabled = true;
            addScoreToAwayTeam.disabled = true;

            const timeoutBtn1 = document.querySelector('.timeout-a');
            const timeoutBtn2 = document.querySelector('.timeout-b');

            timeoutBtn1.disabled = true;
            timeoutBtn2.disabled = true;




            setTimeout(() => {
                this.hideDiv(cdTimer);
                this.countDownTimer.reset();
                this.countDownTimer.stop();
                cdTimer.style.color = 'black';

                this.hideDiv(teamsTimeOut);
                teamsTimeOut.innerText = '';
                this.timer.start();
                addScoreToHomeTeam.disabled = false;
                addScoreToAwayTeam.disabled = false;




                if (timeoutBtn1.innerText != 'CALL TIMEOUT') {
                    timeoutBtn1.disabled = true;
                } else {
                    timeoutBtn1.disabled = false;
                }

                if (timeoutBtn2.innerText != 'CALL TIMEOUT') {
                    timeoutBtn2.disabled = true;
                } else {
                    timeoutBtn2.disabled = false;
                }

                if (document.querySelector('.service-div') !== null) {
                    document.querySelector('.service-div').style.display = 'block';
                }



            }, 3000); // 3000 milliseconds = 60 seconds


        }

        // timeOutEncounter.style.cssText = 'width: 300px; height: 200px; margin: 20px;';
    };

    disableOtherSets() {

        let setMenu = document.getElementById('currentSet');
        let options = setMenu.options;

        for (let i = 1; i < options.length; i++) {
            options[i].disabled = true;
        }
    }


    disableOtherTeam() {

        let selectHomeTeam = document.getElementById('hteam');
        let selectAwayTeam = document.getElementById('ateam');

        for (let i = 0; i < selectHomeTeam.options.length; i++) {
            selectHomeTeam.options[i].disabled = true;
        }

        for (let i = 0; i < selectAwayTeam.options.length; i++) {
            selectAwayTeam.options[i].disabled = true;
        }
    }

    serviceDivInit() {
        const selectedTeam = document.getElementById('hteam');
        const serviceDiv = document.createElement('div');
        serviceDiv.className = 'service-div';
        serviceDiv.innerText = `${selectedTeam.value} has the service`;
        serviceDiv.style.margin = '3vh';
        serviceDiv.style.padding = '1vh';
        serviceDiv.style.fontSize = 'x-large';
        serviceDiv.style.fontWeight = '900';
        serviceDiv.style.backgroundColor = 'linear-gradient(300deg, rgb(242, 220, 147), #008aff, rgb(242, 220, 147))';
        serviceDiv.style.fontFamily = `'SquareFont', Times, serif;`;
        serviceDiv.style.fontSize = 'xx-large';
        serviceDiv.style.fontWeight = '800';
        serviceDiv.style.backgroudColor = 'linear-gradient(300deg, rgb(242, 220, 147), #008aff, rgb(242, 220, 147))';
        serviceDiv.style.border = '0.6 vh solid';
        serviceDiv.style.borderColor = 'linear-gradient(300deg, rgb(242, 220, 147), #008aff, rgb(242, 220, 147))';
        serviceDiv.style.borderStyle = 'groove';

        const currSetStats = document.querySelector('.currentSetStats');
        const cdWrap = document.querySelector('.cd-wrapper');

        currSetStats.insertBefore(serviceDiv, cdWrap);
    }

    serviceDivLogic(cdWrap, currSetStats, preExistingSrvDiv, selectedTeam1, selectedTeam2, scA, scB) {


        if (preExistingSrvDiv) {
            currSetStats.removeChild(preExistingSrvDiv);
        }

        if ((parseInt(scA.innerText) > parseInt(scB.innerText)) && (scA.innerText == '8' || scA.innerText == '16')) {
            this.callTimeOut(selectedTeam1.value);
        }

        const serviceDiv = document.createElement('div');
        serviceDiv.className = 'service-div';
        serviceDiv.innerText = `${selectedTeam1.value} has the service`;
        serviceDiv.style.margin = '3vh';
        serviceDiv.style.padding = '1vh';
        serviceDiv.style.fontSize = 'x-large';
        serviceDiv.style.fontWeight = '900';
        serviceDiv.style.backgroundColor = 'linear-gradient(300deg, rgb(242, 220, 147), #008aff, rgb(242, 220, 147))';
        serviceDiv.style.fontFamily = `'SquareFont', Times, serif;`;
        serviceDiv.style.fontSize = 'xx-large';
        serviceDiv.style.fontWeight = '800';
        serviceDiv.style.backgroudColor = 'linear-gradient(300deg, rgb(242, 220, 147), #008aff, rgb(242, 220, 147))';
        serviceDiv.style.border = '0.6 vh solid';
        serviceDiv.style.borderColor = 'linear-gradient(300deg, rgb(242, 220, 147), #008aff, rgb(242, 220, 147))';
        serviceDiv.style.borderStyle = 'groove';


        currSetStats.insertBefore(serviceDiv, cdWrap);

        if ((parseInt(scA.innerText) > parseInt(scB.innerText)) && (scA.innerText == '8' || scA.innerText == '16')) {
            this.hideDiv(serviceDiv);
        }

        if ((parseInt(scA.innerText) >= (parseInt(scB.innerText)) + 2) && (scA.innerText >= 25)) {
            serviceDiv.innerText = `${selectedTeam2.value} has the service`;
        }
    }


    scoreCount() {
        const addScoreToHomeTeam = document.querySelector('.increase-a-score');
        const scoreA = document.getElementById('score-a');
        const addScoreToAwayTeam = document.querySelector('.increase-b-score');
        const scoreB = document.getElementById('score-b');
        const selectHomeTeam = document.getElementById('hteam');
        const selectAwayTeam = document.getElementById('ateam');



        addScoreToHomeTeam.addEventListener('click', () => {
            let currentScoreA = parseInt(scoreA.innerText);
            currentScoreA += 1;
            scoreA.innerText = currentScoreA;
            const countDownDiv = document.querySelector('.cd-wrapper');
            const currSetStats = document.querySelector('.currentSetStats');
            const preExistingServiceDiv = document.querySelector('.service-div');

            this.serviceDivLogic(countDownDiv, currSetStats, preExistingServiceDiv, selectHomeTeam, selectAwayTeam, scoreA, scoreB);
            this.totalPointsA++;

            this.winnerOfTheSet();




        });



        if ((parseInt(scoreB.innerText) > parseInt(scoreA.innerText)) && (scoreB.innerText == '8' || scoreB.innerText == '16')) {
            this.hideDiv(this.serviceDiv);
        }



        addScoreToAwayTeam.addEventListener('click', () => {
            let currentScoreB = parseInt(scoreB.innerText);
            currentScoreB += 1;
            scoreB.innerText = currentScoreB;
            const countDownDiv = document.querySelector('.cd-wrapper');
            const currSetStats = document.querySelector('.currentSetStats');
            const preExistingServiceDiv = document.querySelector('.service-div');


            this.serviceDivLogic(countDownDiv, currSetStats, preExistingServiceDiv, selectAwayTeam, selectHomeTeam, scoreB, scoreA);
            this.totalPointsB++;
            this.winnerOfTheSet();



            //     var serviceDivsCount = document.getElementsByClassName('service-div');


            //     if (serviceDivsCount.length == 1) {

            //     }
        });


    }


    winnerOfTheSet() {
        var scoreA = parseInt(document.getElementById('score-a').innerText);
        var scoreB = parseInt(document.getElementById('score-b').innerText);
        const setMenu = document.getElementById('currentSet');
        var currSetNum;


        if (`${setMenu.value}` != 'Set 5') {
            if ((scoreA >= 25 && scoreA - scoreB >= 2) || (scoreB >= 25 && scoreB - scoreA >= 2)) {
                scoreA > scoreB ? this.wonSetsA++ : this.wonSetsB++;


                document.querySelector('.t1').innerText = this.wonSetsA;
                document.querySelector('.t2').innerText = this.wonSetsB;


                document.getElementById('score-a').innerText = '0';
                document.getElementById('score-b').innerText = '0';


                const setWinDiv = document.createElement('div');
                setWinDiv.className = 'set-w-div';
                setWinDiv.innerText == `${setMenu.value} is done!`;

                this.checkMatchWinner();

                if (!this.checkMatchWinner()) {

                    currSetNum = parseInt(setMenu.value.replace('Set ', '') - 1);
                    // console.log(currSetNum);



                    if (currSetNum < setMenu.options.length - 1) {
                        setMenu.options[currSetNum + 1].disabled = false;
                        setMenu.options[currSetNum].disabled = true;

                        setMenu.selectedIndex = `${currSetNum + 1}`;

                        const timeoutBtn1 = document.querySelector('.timeout-a');
                        const timeoutBtn2 = document.querySelector('.timeout-b');

                        timeoutBtn1.innerText = 'CALL TIMEOUT';
                        timeoutBtn2.innerText = 'CALL TIMEOUT';
                        timeoutBtn1.disabled = false;
                        timeoutBtn2.disabled = false;
                    }
                }

            }


        } else if (`${setMenu.value}` == 'Set 5') {
            if ((scoreA >= 15 && scoreA - scoreB >= 2) || (scoreB >= 15 && scoreB - scoreA >= 2)) {
                if (scoreA > scoreB) this.wonSetsA++;
                else this.wonSetsB++;

                document.getElementById('score-a').innerText = '0';
                document.getElementById('score-b').innerText = '0';


                document.querySelector('.t1').innerText = this.wonSetsA;
                document.querySelector('.t2').innerText = this.wonSetsB;

                this.checkMatchWinner();

            }

        }

        if (this.checkMatchWinner()) {

            // const countDownDiv = document.querySelector('.cd-wrapper');
            // const set = document.querySelector('.set');


            // const winningDiv = document.createElement('div');
            // winningDiv.className = 'i-won';
            document.querySelector('.service-div').innerText = `${this.checkMatchWinner()} won the Match!`;
            // winningDiv.style.marginTop = '1vh';
            // winningDiv.style.fontSize = 'xx-large';
            // winningDiv.style.fontWeight = '900';
            // winningDiv.style.backgroundColor = '#007bff';
            // winningDiv.style.fontFamily = `'Times New Roman', Times, serif `;
            // winningDiv.style.fontSize = 'xx-large';
            // winningDiv.style.fontWeight = '800';
            // winningDiv.style.backgroudColor = 'white';
            // winningDiv.style.border = '0.6 vh solid';
            // winningDiv.style.borderColor = '#008aff';
            // winningDiv.style.borderStyle = 'groove';

            // set.insertBefore(winningDiv, countDownDiv);



            const timeoutBtn1 = document.querySelector('.timeout-a');
            const timeoutBtn2 = document.querySelector('.timeout-b');
            const addScoreToHomeTeam = document.querySelector('.increase-a-score');
            const addScoreToAwayTeam = document.querySelector('.increase-b-score');
            timeoutBtn1.disabled = true;
            timeoutBtn2.disabled = true;
            addScoreToHomeTeam.disabled = true;
            addScoreToAwayTeam.disabled = true;

            document.getElementById('download-results').disabled = false;
            this.downloadCSV(document.getElementById('hteam').value, document.getElementById('ateam').value, this.wonSetsA, this.wonSetsB, this.totalPointsA, this.totalPointsB)


        }
    }

    checkMatchWinner() {

        const selectHomeTeam = document.getElementById('hteam');
        const selectAwayTeam = document.getElementById('ateam');

        if (this.wonSetsA === 3 || this.wonSetsB === 3) {
            let winner;
            if (this.wonSetsA === 3) {
                winner = selectHomeTeam.value;
            } else if (this.wonSetsB === 3) {
                winner = selectAwayTeam.value;
            }

            return winner;
        }
    }




    downloadCSV(teamA, teamB, setScoreA, setScoreB, totalPointsA, totalPointsB) {

        const teamNames = [`${teamA}`, `${teamB}`];
        const setScores = [`${setScoreA}`, `${setScoreB}`];
        const totalPoints = [`${totalPointsA}`, `${totalPointsB}`];

        let csvContent = 'data:text/csv;charset=utf-8,';
        csvContent += 'Team Name,Set Score,Total Points\r\n';

        for (let i = 0; i < teamNames.length; i++) {
            let row = [teamNames[i], setScores[i], totalPoints[i]].join(',');
            csvContent += row + '\r\n';
        }

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const tempLink = document.createElement('a');
        tempLink.href = url;
        tempLink.download = 'setscores.csv';
        tempLink.style.display = 'none';
        document.body.appendChild(tempLink);

        tempLink.click();

        document.body.removeChild(tempLink);

    }



}

new VolleyballMatch();