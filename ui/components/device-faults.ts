import { ClosureComponent, Component } from 'mithril';
import { m } from '../components.ts';
import * as store from '../store.ts';
import * as notifications from '../notifications.ts';
import { stringify } from '../../lib/common/yaml.ts';

const component: ClosureComponent = (): Component => {
    return {
        view: (vnode) => {
            const device   = vnode.attrs['device'];
            const deviceId = device['DeviceID.ID'].value[0];
            const faults   = store.fetch('faults', [
                'AND',
                ['>', ['PARAM', '_id'], `${deviceId}:`],
                ['<', ['PARAM', '_id'], `${deviceId}:zzzz`],
            ]);

            const headers = [
                'Channel',
                'Code',
                'Message',
                'Detail',
                'Retries',
                'Timestamp',
                '',
            ].map((l) => m('th', l));
            const thead   = m('thead', m('tr', headers));

            const rows = [];
            for (const f of faults.value) {
                rows.push([
                              m('td', f['channel']),
                              m('td', f['code']),
                              m('td', m('long-text', {text: f['message']})),
                              m('td', m('long-text', {text: stringify(f['detail'])})),

                              m('td', f['retries']),
                              m('td', new Date(f['timestamp']).toLocaleString()),
                              m(
                                  'td',
                                  m(
                                      'button.btn.btn-sm.btn-outline-danger',
                                      {
                                          title  : 'Delete Fault',
                                          onclick: (e) => {
                                              e.redraw = false;
                                              store
                                                  .deleteResource('faults', f['_id'])
                                                  .then(() => {
                                                      notifications.push('success', 'Fault Deleted!');
                                                      store.setTimestamp(Date.now());
                                                      m.redraw();
                                                  })
                                                  .catch((err) => {
                                                      notifications.push('error', err.message);
                                                      store.setTimestamp(Date.now());
                                                  });
                                          },
                                      },
                                      m('i.bi.bi-trash'),
                                  ),
                              ),
                          ]);
            }

            let tbody: any;
            if (rows.length) {
                tbody = m('tbody', rows.map((r) => m('tr', r)));
            } else {
                tbody = m('tbody', m('tr.empty', m('td.text-center', {colspan: headers.length}, 'No faults')));
            }

            return m('.col-lg-12', m('.card', m('.card-body', [
                m('h5.card-title', 'Faults'),
                m('loading', {queries: [faults]}, m('table.table.table-hover', thead, tbody)),
            ])));
        },
    };
};

export default component;
