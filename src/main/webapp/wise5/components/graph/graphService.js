'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _nodeService = require('../../services/nodeService');

var _nodeService2 = _interopRequireDefault(_nodeService);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var GraphService = function (_NodeService) {
    _inherits(GraphService, _NodeService);

    function GraphService($filter, StudentDataService, UtilService) {
        _classCallCheck(this, GraphService);

        var _this = _possibleConstructorReturn(this, (GraphService.__proto__ || Object.getPrototypeOf(GraphService)).call(this));

        _this.$filter = $filter;
        _this.StudentDataService = StudentDataService;
        _this.UtilService = UtilService;

        _this.$translate = _this.$filter('translate');
        return _this;
    }

    /**
     * Create a Graph component object
     * @returns a new Graph component object
     */


    _createClass(GraphService, [{
        key: 'createComponent',
        value: function createComponent() {

            var component = {};
            component.id = this.UtilService.generateKey();
            component.type = 'Graph';
            component.prompt = this.$translate('ENTER_PROMPT_HERE');
            component.showSaveButton = false;
            component.showSubmitButton = false;
            component.title = this.$translate('graph.enterGraphTitleHere');
            component.width = 800;
            component.height = 500;
            component.enableTrials = false;
            component.canCreateNewTrials = false;
            component.canDeleteTrials = false;
            component.showAllTrialsOnNewTrial = false;
            component.canStudentHideSeriesOnLegendClick = false;
            component.roundValuesTo = null;
            component.graphType = 'line';
            component.xAxis = {
                title: {
                    text: this.$translate('graph.timeSeconds')
                },
                min: 0,
                max: 10,
                units: this.$translate('graph.secondsUnit')
            };
            component.yAxis = {
                title: {
                    text: this.$translate('graph.positionMeters')
                },
                min: 0,
                max: 10,
                units: this.$translate('graph.metersUnit')
            };
            component.series = [{
                name: this.$translate('graph.prediction'),
                data: [],
                color: 'blue',
                marker: {
                    symbol: 'circle'
                },
                regression: false,
                regressionSettings: {},
                canEdit: true
            }];

            return component;
        }

        /**
         * Copies an existing Graph component object
         * @returns a copied Graph component object
         */

    }, {
        key: 'copyComponent',
        value: function copyComponent(componentToCopy) {
            var component = this.createComponent();
            component.prompt = componentToCopy.prompt;
            component.showSaveButton = componentToCopy.showSaveButton;
            component.showSubmitButton = componentToCopy.showSubmitButton;
            component.title = componentToCopy.title;
            component.xAxis = componentToCopy.xAxis;
            component.yAxis = componentToCopy.yAxis;
            component.series = componentToCopy.series;
            return component;
        }

        /**
         * Populate a component state with the data from another component state
         * @param componentStateFromOtherComponent the component state to obtain the data from
         * @return a new component state that contains the student data from the other
         * component state
         */

    }, {
        key: 'populateComponentState',
        value: function populateComponentState(componentStateFromOtherComponent) {
            var componentState = null;

            if (componentStateFromOtherComponent != null) {

                // create an empty component state
                componentState = this.StudentDataService.createComponentState();

                // get the component type of the other component state
                var otherComponentType = componentStateFromOtherComponent.componentType;

                if (otherComponentType === 'Graph') {
                    // the other component is an Graph component

                    // get the student data from the other component state
                    var studentData = componentStateFromOtherComponent.studentData;

                    // create a copy of the student data
                    var studentDataCopy = this.UtilService.makeCopyOfJSONObject(studentData);

                    // set the student data into the new component state
                    componentState.studentData = studentDataCopy;
                }
            }

            return componentState;
        }
    }, {
        key: 'generateRegressionSeries',


        /**
         * Code extracted from https://github.com/streamlinesocial/highcharts-regression
         * Loop through all the series that are passed in and find the ones that we
         * need to generate a regression series for. Return the regression series
         * that are generated in an array.
         * @param series an array of series
         * @return an array of regression series
         */
        value: function generateRegressionSeries(series) {
            var regressionSeries = [];
            var i = 0;
            for (i = 0; i < series.length; i++) {
                var s = series[i];
                if (s.regression) {
                    s.regressionSettings = s.regressionSettings || {};
                    var regressionType = s.regressionSettings.type || "linear";
                    var regression;

                    var color = s.color;

                    if (s.regressionSettings.color != null) {
                        color = s.regressionSettings.color;
                    }

                    var extraSerie = {
                        data: [],
                        color: color,
                        yAxis: s.yAxis,
                        lineWidth: 2,
                        marker: { enabled: false },
                        isRegressionLine: true,
                        name: s.regressionSettings.label || "Equation: %eq"
                    };

                    extraSerie.type = "spline";

                    if (regressionType == "linear") {
                        regression = this._linear(s.data, s.regressionSettings);
                        extraSerie.type = "line";
                    } else if (regressionType == "exponential") {
                        regression = this._exponential(s.data, s.regressionSettings);
                    } else if (regressionType == "polynomial") {
                        regression = this._polynomial(s.data, 2, s.regressionSettings);
                    } else if (regressionType == "logarithmic") {
                        regression = this._logarithmic(s.data, s.regressionSettings);
                    } else if (regressionType == "loess") {
                        var loessSmooth = s.regressionSettings.loessSmooth || 25;
                        regression = this._loess(s.data, loessSmooth / 100);
                    } else {
                        console.error("Invalid regression type: ", regressionType);
                        break;
                    }

                    regression.rSquared = this.coefficientOfDetermination(s.data, regression.points).toFixed(2);
                    regression.rValue = Math.sqrt(regression.rSquared, 2).toFixed(2);
                    extraSerie.data = regression.points;
                    extraSerie.name = extraSerie.name.replace("%r2", regression.rSquared);
                    extraSerie.name = extraSerie.name.replace("%r", regression.rValue);
                    extraSerie.name = extraSerie.name.replace("%eq", regression.string);

                    extraSerie.regressionOutputs = regression;

                    regressionSeries.push(extraSerie);
                }
            }

            return regressionSeries;
        }
    }, {
        key: '_exponential',


        /**
         * Code extracted from https://github.com/Tom-Alexander/regression-js/
         */
        value: function _exponential(data, regressionSettings) {
            var sum = [0, 0, 0, 0, 0, 0],
                n = 0,
                results = [];

            for (len = data.length; n < len; n++) {
                if (data[n]['x']) {
                    data[n][0] = data[n]['x'];
                    data[n][1] = data[n]['y'];
                }
                if (data[n][1]) {
                    sum[0] += data[n][0]; // X
                    sum[1] += data[n][1]; // Y
                    sum[2] += data[n][0] * data[n][0] * data[n][1]; // XXY
                    sum[3] += data[n][1] * Math.log(data[n][1]); // Y Log Y
                    sum[4] += data[n][0] * data[n][1] * Math.log(data[n][1]); //YY Log Y
                    sum[5] += data[n][0] * data[n][1]; //XY
                }
            }

            var denominator = sum[1] * sum[2] - sum[5] * sum[5];
            var A = Math.pow(Math.E, (sum[2] * sum[3] - sum[5] * sum[4]) / denominator);
            var B = (sum[1] * sum[4] - sum[5] * sum[3]) / denominator;

            if (regressionSettings != null && regressionSettings.xMin != null && regressionSettings.xMax != null && regressionSettings.numberOfPoints != null) {

                //regression settings have been provided

                /*
                 * get the xMin and xMax so we know over what range to plot
                 * regression points for
                 */
                var xMin = regressionSettings.xMin;
                var xMax = regressionSettings.xMax;

                //get the number of points that should be plotted on the regression line
                var numberOfPoints = regressionSettings.numberOfPoints;

                //get the distance between the xMin and xMax
                var xSpan = xMax - xMin;

                //calculate the points on the regression line
                for (var i = 0; i < numberOfPoints; i++) {
                    var x = xMin + xSpan * (i / numberOfPoints);

                    var coordinate = [x, A * Math.pow(Math.E, B * x)];
                    results.push(coordinate);
                }
            } else {
                /*
                 * regression settings have not been provided so we will use the default
                 * x values for the regression points
                 */
                for (var i = 0, len = data.length; i < len; i++) {
                    var coordinate = [data[i][0], A * Math.pow(Math.E, B * data[i][0])];
                    results.push(coordinate);
                }
            }

            results.sort(function (a, b) {
                if (a[0] > b[0]) {
                    return 1;
                }
                if (a[0] < b[0]) {
                    return -1;
                }
                return 0;
            });

            var string = 'y = ' + Math.round(A * 100) / 100 + 'e^(' + Math.round(B * 100) / 100 + 'x)';

            return { equation: [A, B], points: results, string: string };
        }

        /**
         * Code extracted from https://github.com/Tom-Alexander/regression-js/
         * Human readable formulas:
         *
         *              N * Σ(XY) - Σ(X)
         * intercept = ---------------------
         *              N * Σ(X^2) - Σ(X)^2
         *
         * correlation = N * Σ(XY) - Σ(X) * Σ (Y) / √ (  N * Σ(X^2) - Σ(X) ) * ( N * Σ(Y^2) - Σ(Y)^2 ) ) )
         *
         */

    }, {
        key: '_linear',
        value: function _linear(data, regressionSettings) {
            var sum = [0, 0, 0, 0, 0],
                n = 0,
                results = [],
                N = data.length;

            for (; n < data.length; n++) {
                if (data[n]['x']) {
                    data[n][0] = data[n]['x'];
                    data[n][1] = data[n]['y'];
                }
                if (data[n][1]) {
                    sum[0] += data[n][0]; //Σ(X)
                    sum[1] += data[n][1]; //Σ(Y)
                    sum[2] += data[n][0] * data[n][0]; //Σ(X^2)
                    sum[3] += data[n][0] * data[n][1]; //Σ(XY)
                    sum[4] += data[n][1] * data[n][1]; //Σ(Y^2)
                }
            }

            var gradient = (n * sum[3] - sum[0] * sum[1]) / (n * sum[2] - sum[0] * sum[0]);
            var intercept = sum[1] / n - gradient * sum[0] / n;
            //var correlation = (n * sum[3] - sum[0] * sum[1]) / Math.sqrt((n * sum[2] - sum[0] * sum[0]) * (n * sum[4] - sum[1] * sum[1]));

            if (regressionSettings != null && regressionSettings.xMin != null && regressionSettings.xMax != null && regressionSettings.numberOfPoints != null) {

                //regression settings have been provided

                /*
                 * get the xMin and xMax so we know over what range to plot
                 * regression points for
                 */
                var xMin = regressionSettings.xMin;
                var xMax = regressionSettings.xMax;

                //get the number of points that should be plotted on the regression line
                var numberOfPoints = regressionSettings.numberOfPoints;

                //get the distance between the xMin and xMax
                var xSpan = xMax - xMin;

                //calculate the points on the regression line
                for (var i = 0; i < numberOfPoints; i++) {
                    var x = xMin + xSpan * (i / numberOfPoints);

                    var coordinate = [x, x * gradient + intercept];
                    results.push(coordinate);
                }
            } else {
                /*
                 * regression settings have not been provided so we will use the default
                 * x values for the regression points
                 */
                for (var i = 0, len = data.length; i < len; i++) {
                    var coordinate = [data[i][0], data[i][0] * gradient + intercept];
                    results.push(coordinate);
                }
            }

            results.sort(function (a, b) {
                if (a[0] > b[0]) {
                    return 1;
                }
                if (a[0] < b[0]) {
                    return -1;
                }
                return 0;
            });

            var string = 'y = ' + Math.round(gradient * 100) / 100 + 'x + ' + Math.round(intercept * 100) / 100;
            return { equation: [gradient, intercept], points: results, string: string };
        }

        /**
         *  Code extracted from https://github.com/Tom-Alexander/regression-js/
         */

    }, {
        key: '_logarithmic',
        value: function _logarithmic(data, regressionSettings) {
            var sum = [0, 0, 0, 0],
                n = 0,
                results = [],
                mean = 0;

            for (len = data.length; n < len; n++) {
                if (data[n]['x']) {
                    data[n][0] = data[n]['x'];
                    data[n][1] = data[n]['y'];
                }
                if (data[n][1]) {
                    sum[0] += Math.log(data[n][0]);
                    sum[1] += data[n][1] * Math.log(data[n][0]);
                    sum[2] += data[n][1];
                    sum[3] += Math.pow(Math.log(data[n][0]), 2);
                }
            }

            var B = (n * sum[1] - sum[2] * sum[0]) / (n * sum[3] - sum[0] * sum[0]);
            var A = (sum[2] - B * sum[0]) / n;

            if (regressionSettings != null && regressionSettings.xMin != null && regressionSettings.xMax != null && regressionSettings.numberOfPoints != null) {

                //regression settings have been provided

                /*
                 * get the xMin and xMax so we know over what range to plot
                 * regression points for
                 */
                var xMin = regressionSettings.xMin;
                var xMax = regressionSettings.xMax;

                //get the number of points that should be plotted on the regression line
                var numberOfPoints = regressionSettings.numberOfPoints;

                //get the distance between the xMin and xMax
                var xSpan = xMax - xMin;

                //calculate the points on the regression line
                for (var i = 0; i < numberOfPoints; i++) {
                    var x = xMin + xSpan * (i / numberOfPoints);

                    if (x > 0) {
                        var y = A + B * Math.log(x);

                        if (!isNaN(y)) {
                            var coordinate = [x, y];
                            results.push(coordinate);
                        }
                    }
                }
            } else {
                /*
                 * regression settings have not been provided so we will use the default
                 * x values for the regression points
                 */
                for (var i = 0, len = data.length; i < len; i++) {
                    var coordinate = [data[i][0], A + B * Math.log(data[i][0])];
                    results.push(coordinate);
                }
            }

            results.sort(function (a, b) {
                if (a[0] > b[0]) {
                    return 1;
                }
                if (a[0] < b[0]) {
                    return -1;
                }
                return 0;
            });

            var string = 'y = ' + Math.round(A * 100) / 100 + ' + ' + Math.round(B * 100) / 100 + ' ln(x)';

            return { equation: [A, B], points: results, string: string };
        }

        /**
         * Code extracted from https://github.com/Tom-Alexander/regression-js/
         */

    }, {
        key: '_power',
        value: function _power(data) {
            var sum = [0, 0, 0, 0],
                n = 0,
                results = [];

            for (len = data.length; n < len; n++) {
                if (data[n]['x']) {
                    data[n][0] = data[n]['x'];
                    data[n][1] = data[n]['y'];
                }
                if (data[n][1]) {
                    sum[0] += Math.log(data[n][0]);
                    sum[1] += Math.log(data[n][1]) * Math.log(data[n][0]);
                    sum[2] += Math.log(data[n][1]);
                    sum[3] += Math.pow(Math.log(data[n][0]), 2);
                }
            }

            var B = (n * sum[1] - sum[2] * sum[0]) / (n * sum[3] - sum[0] * sum[0]);
            var A = Math.pow(Math.E, (sum[2] - B * sum[0]) / n);

            for (var i = 0, len = data.length; i < len; i++) {
                var coordinate = [data[i][0], A * Math.pow(data[i][0], B)];
                results.push(coordinate);
            }

            results.sort(function (a, b) {
                if (a[0] > b[0]) {
                    return 1;
                }
                if (a[0] < b[0]) {
                    return -1;
                }
                return 0;
            });

            var string = 'y = ' + Math.round(A * 100) / 100 + 'x^' + Math.round(B * 100) / 100;

            return { equation: [A, B], points: results, string: string };
        }

        /**
         * Code extracted from https://github.com/Tom-Alexander/regression-js/
         */

    }, {
        key: '_polynomial',
        value: function _polynomial(data, order, regressionSettings) {
            if (typeof order == 'undefined') {
                order = 2;
            }
            var lhs = [],
                rhs = [],
                results = [],
                a = 0,
                b = 0,
                i = 0,
                k = order + 1;

            for (; i < k; i++) {
                for (var l = 0, len = data.length; l < len; l++) {
                    if (data[l]['x']) {
                        data[l][0] = data[l]['x'];
                        data[l][1] = data[l]['y'];
                    }
                    if (data[l][1]) {
                        a += Math.pow(data[l][0], i) * data[l][1];
                    }
                }
                lhs.push(a), a = 0;
                var c = [];
                for (var j = 0; j < k; j++) {
                    for (var l = 0, len = data.length; l < len; l++) {
                        if (data[l][1]) {
                            b += Math.pow(data[l][0], i + j);
                        }
                    }
                    c.push(b), b = 0;
                }
                rhs.push(c);
            }
            rhs.push(lhs);

            var equation = this.gaussianElimination(rhs, k);

            if (regressionSettings != null && regressionSettings.xMin != null && regressionSettings.xMax != null && regressionSettings.numberOfPoints != null) {

                //regression settings have been provided

                /*
                 * get the xMin and xMax so we know over what range to plot
                 * regression points for
                 */
                var xMin = regressionSettings.xMin;
                var xMax = regressionSettings.xMax;

                //get the number of points that should be plotted on the regression line
                var numberOfPoints = regressionSettings.numberOfPoints;

                //get the distance between the xMin and xMax
                var xSpan = xMax - xMin;

                //calculate the points on the regression line
                for (var i = 0; i < numberOfPoints; i++) {
                    var x = xMin + xSpan * (i / numberOfPoints);
                    var answer = 0;
                    for (var w = 0; w < equation.length; w++) {
                        answer += equation[w] * Math.pow(x, w);
                    }
                    results.push([x, answer]);
                }
            } else {
                /*
                 * regression settings have not been provided so we will use the default
                 * x values for the regression points
                 */
                for (var i = 0, len = data.length; i < len; i++) {
                    var answer = 0;
                    for (var w = 0; w < equation.length; w++) {
                        answer += equation[w] * Math.pow(data[i][0], w);
                    }
                    results.push([data[i][0], answer]);
                }
            }

            results.sort(function (a, b) {
                if (a[0] > b[0]) {
                    return 1;
                }
                if (a[0] < b[0]) {
                    return -1;
                }
                return 0;
            });

            var string = 'y = ';

            for (var i = equation.length - 1; i >= 0; i--) {
                if (i > 1) string += Math.round(equation[i] * 100) / 100 + 'x^' + i + ' + ';else if (i == 1) string += Math.round(equation[i] * 100) / 100 + 'x' + ' + ';else string += Math.round(equation[i] * 100) / 100;
            }

            return { equation: equation, points: results, string: string };
        }

        /**
         * @author: Ignacio Vazquez
         * Based on
         * - http://commons.apache.org/proper/commons-math/download_math.cgi LoesInterpolator.java
         * - https://gist.github.com/avibryant/1151823
         */

    }, {
        key: '_loess',
        value: function _loess(data, bandwidth) {
            var bandwidth = bandwidth || 0.25;

            var xval = data.map(function (pair) {
                return pair[0];
            });
            var distinctX = array_unique(xval);
            if (2 / distinctX.length > bandwidth) {
                bandwidth = Math.min(2 / distinctX.length, 1);
                console.warn("updated bandwith to " + bandwidth);
            }

            var yval = data.map(function (pair) {
                return pair[1];
            });

            function array_unique(values) {
                var o = {},
                    i,
                    l = values.length,
                    r = [];
                for (i = 0; i < l; i += 1) {
                    o[values[i]] = values[i];
                }for (i in o) {
                    r.push(o[i]);
                }return r;
            }

            function tricube(x) {
                var tmp = 1 - x * x * x;
                return tmp * tmp * tmp;
            }

            var res = [];

            var left = 0;
            var right = Math.floor(bandwidth * xval.length) - 1;

            for (var i in xval) {
                var x = xval[i];

                if (i > 0) {
                    if (right < xval.length - 1 && xval[right + 1] - xval[i] < xval[i] - xval[left]) {
                        left++;
                        right++;
                    }
                }
                //console.debug("left: "+left  + " right: " + right );
                var edge;
                if (xval[i] - xval[left] > xval[right] - xval[i]) edge = left;else edge = right;
                var denom = Math.abs(1.0 / (xval[edge] - x));
                var sumWeights = 0;
                var sumX = 0,
                    sumXSquared = 0,
                    sumY = 0,
                    sumXY = 0;

                var k = left;
                while (k <= right) {
                    var xk = xval[k];
                    var yk = yval[k];
                    var dist;
                    if (k < i) {
                        dist = x - xk;
                    } else {
                        dist = xk - x;
                    }
                    var w = tricube(dist * denom);
                    var xkw = xk * w;
                    sumWeights += w;
                    sumX += xkw;
                    sumXSquared += xk * xkw;
                    sumY += yk * w;
                    sumXY += yk * xkw;
                    k++;
                }

                var meanX = sumX / sumWeights;
                //console.debug(meanX);
                var meanY = sumY / sumWeights;
                var meanXY = sumXY / sumWeights;
                var meanXSquared = sumXSquared / sumWeights;

                var beta;
                if (meanXSquared == meanX * meanX) beta = 0;else beta = (meanXY - meanX * meanY) / (meanXSquared - meanX * meanX);

                var alpha = meanY - beta * meanX;
                res[i] = beta * x + alpha;
            }
            console.debug(res);
            return {
                equation: "",
                points: xval.map(function (x, i) {
                    return [x, res[i]];
                }),
                string: ""
            };
        }

        /**
         * Code extracted from https://github.com/Tom-Alexander/regression-js/
         */

    }, {
        key: 'gaussianElimination',
        value: function gaussianElimination(a, o) {
            var i = 0,
                j = 0,
                k = 0,
                maxrow = 0,
                tmp = 0,
                n = a.length - 1,
                x = new Array(o);
            for (i = 0; i < n; i++) {
                maxrow = i;
                for (j = i + 1; j < n; j++) {
                    if (Math.abs(a[i][j]) > Math.abs(a[i][maxrow])) maxrow = j;
                }
                for (k = i; k < n + 1; k++) {
                    tmp = a[k][i];
                    a[k][i] = a[k][maxrow];
                    a[k][maxrow] = tmp;
                }
                for (j = i + 1; j < n; j++) {
                    for (k = n; k >= i; k--) {
                        a[k][j] -= a[k][i] * a[i][j] / a[i][i];
                    }
                }
            }
            for (j = n - 1; j >= 0; j--) {
                tmp = 0;
                for (k = j + 1; k < n; k++) {
                    tmp += a[k][j] * x[k];
                }x[j] = (a[n][j] - tmp) / a[j][j];
            }
            return x;
        }

        /**
         * @author Ignacio Vazquez
         * See http://en.wikipedia.org/wiki/Coefficient_of_determination for theaorical details
         */

    }, {
        key: 'coefficientOfDetermination',
        value: function coefficientOfDetermination(data, pred) {

            var i = 0;
            var SSE = 0;
            var SSYY = 0;
            var mean = 0;

            // Calc the mean
            for (i = 0; i < data.length; i++) {
                mean += data[i][1] / data.length;
            }

            // Calc the coefficent of determination
            for (i = 0; i < data.length; i++) {
                SSYY += Math.pow(data[i][1] - pred[i][1], 2);
                SSE += Math.pow(data[i][1] - mean, 2);
            }
            return 1 - SSYY / SSE;
        }

        /**
         * Check if the component was completed
         * @param component the component object
         * @param componentStates the component states for the specific component
         * @param componentEvents the events for the specific component
         * @param nodeEvents the events for the parent node of the component
         * @param node parent node of the component
         * @returns whether the component was completed
         */

    }, {
        key: 'isCompleted',
        value: function isCompleted(component, componentStates, componentEvents, nodeEvents, node) {
            var result = false;

            if (componentStates && componentStates.length) {
                var submitRequired = node.showSubmitButton || component.showSubmitButton && !node.showSaveButton;

                if (submitRequired) {
                    // completion requires a submission, so check for isSubmit in any component states
                    for (var i = 0, l = componentStates.length; i < l; i++) {
                        var state = componentStates[i];
                        if (state.isSubmit && state.studentData) {
                            // component state is a submission
                            if (this.hasSeriesData(studentData) || this.hasTrialData(studentData)) {
                                // there is series data so the component is completed
                                result = true;
                                break;
                            }
                        }
                    }
                } else {
                    // get the last component state
                    var _l = componentStates.length - 1;
                    var componentState = componentStates[_l];

                    var _studentData = componentState.studentData;

                    if (_studentData) {
                        if (this.hasSeriesData(_studentData) || this.hasTrialData(_studentData)) {
                            // there is series data so the component is completed
                            result = true;
                        }
                    }
                }
            }

            return result;
        }
    }, {
        key: 'hasSeriesData',


        /**
         * Check if student data contains any series data
         * @param studentData student data from a component state
         * @returns whether the student data has series data
         */
        value: function hasSeriesData(studentData) {
            var result = false;

            var series = studentData.series;
            if (series && series.length) {
                // check for any data in any series
                for (var i = 0, l = series.length; i < l; i++) {
                    var data = series[i].data;

                    if (data && data.length) {
                        // there is series data so the component is completed
                        result = true;
                        break;
                    }
                }
            }

            return result;
        }
    }, {
        key: 'hasTrialData',


        /**
         * Check if the student data contains any trial data
         * @param studentData student data from a component state
         * @return whether the student data has trial data
         */
        value: function hasTrialData(studentData) {
            var result = false;

            if (studentData != null) {
                var trials = studentData.trials;

                if (trials != null) {

                    // loop through all the trials
                    for (var t = 0; t < trials.length; t++) {

                        var trial = trials[t];

                        if (trial != null) {
                            var series = trial.series;

                            // loop through all the series
                            for (var s = 0; s < series.length; s++) {

                                // get a single series
                                var singleSeries = series[s];

                                if (singleSeries != null) {

                                    // get the data from the single series
                                    var data = singleSeries.data;

                                    if (data != null && data.length > 0) {
                                        // the single series has data
                                        return true;
                                    }
                                }
                            }
                        }
                    }
                }
            }

            return result;
        }

        /**
         * Whether this component generates student work
         * @param component (optional) the component object. if the component object
         * is not provided, we will use the default value of whether the
         * component type usually has work.
         * @return whether this component generates student work
         */

    }, {
        key: 'componentHasWork',
        value: function componentHasWork(component) {
            return true;
        }
    }]);

    return GraphService;
}(_nodeService2.default);

GraphService.$inject = ['$filter', 'StudentDataService', 'UtilService'];

exports.default = GraphService;
//# sourceMappingURL=graphService.js.map