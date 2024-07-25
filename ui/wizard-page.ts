import m, { ClosureComponent, Component } from 'mithril';
import * as notifications from './notifications.ts';

export async function init(): Promise<Record<string, unknown>> {
    return m.request({url: 'init'});
}

export const component: ClosureComponent = (vnode): Component => {
    let options    = vnode.attrs;
    const selected = new Set<string>();
    for (const [k, v] of Object.entries(options)) if (v) selected.add(k);

    return {
        view: () => {
            document.title = 'Initialization wizard - ProACS';

            const checkboxes = [
                'users',
                'filters',
                'device',
                'index',
                'presets',
            ].map((s) => {
                if (!options[s]) selected.delete(s);
                return m('input', {
                    type    : 'checkbox',
                    checked : selected.has(s),
                    disabled: !options[s],
                    style   : 'display: inline; margin-right: 0.5em;',
                    onclick : (e) => {
                        if (e.target.checked) selected.add(s);
                        else selected.delete(s);
                    },
                });
            });

            return m('.wizard-dialog', [
                m('h1', 'Initialization wizard'),
                m('p', 'This wizard will seed the database with a minimal initial configuration to serve as a starting point. Select what you want to initialize and click \'ABRACADABRA!\'.'),
                m('div', m('label', checkboxes[0], 'Users, roles and permissions')),
                m('div', m('label', checkboxes[1], 'Devices predefined search filters')),
                m('div', m('label', checkboxes[2], 'Device details page')),
                m('div', m('label', checkboxes[3], 'Devices listing page')),
                m('div', m('label', checkboxes[4], 'Presets and provisions')),
                m(
                    'button.primary',
                    {
                        style   : 'margin: 10px;',
                        disabled: selected.size === 0,
                        onclick : (e) => {
                            e.target.disabled = true;

                            const opts = {};
                            for (const s of selected) opts[s] = true;

                            m.request({method: 'POST', url: 'init', body: opts})
                                .then(() => {
                                    setTimeout(() => {
                                        m.request({url: 'init'})
                                            .then((o) => {
                                                e.target.disabled = false;
                                                options           = o;
                                                notifications.push(
                                                    'success',
                                                    'Initialization Complete!',
                                                    {
                                                        'Open Sesame!': () => {
                                                            m.route.set('/login');
                                                            window.location.reload();
                                                        },
                                                    },
                                                );
                                            })
                                            .catch((err) => {
                                                notifications.push('error', err.message);
                                            });
                                    }, 3000);
                                    if (opts['users']) {
                                        alert(
                                            'An administrator user has been created for you. ' +
                                            'Use admin@probit.com/ProbitACS2024 to log in. ' +
                                            'Don\'t forget to change the default password.',
                                        );
                                    }
                                })
                                .catch((err) => {
                                    notifications.push('error', err.message);
                                });
                        },
                    },
                    'ABRACADABRA!',
                ),
            ]);
        },
    };
};
