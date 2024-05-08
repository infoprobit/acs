import { ClosureComponent, Component } from 'mithril';
import { m } from '../components.ts';
import ApexCharts from 'apexcharts'

let chart: ApexCharts;

let ACharts = {
    oncreate: function (vnode) {
        let options = {
            series: vnode.attrs.series,
            chart : {type: 'bar', height: 400},
            colors: ['#002f87', '#006f90', '#aea09b'],
            xaxis : {categories: vnode.attrs.categories},
        }

        chart = new ApexCharts(document.querySelector('#chart'), options);
        chart.render();
    },
    onupdate: function (vnode) {
        chart.updateOptions({series: vnode.attrs.series, xaxis: {categories: vnode.attrs.categories}});
    },
    view    : function () {
        return m('div', {id: 'chart'})
    },
}

const component: ClosureComponent = (): Component => {
    return {
        view: (vnode) => {
            return m('.col-lg-12', m('.card', m('.card-body', [
                m('h5.card-title', ''),
                m(ACharts, vnode.attrs['data']),
            ])))
        },
    };
};

export default component;
