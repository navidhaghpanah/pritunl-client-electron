/// <reference path="../References.d.ts"/>
import * as React from 'react';
import * as Electron from "electron";
import * as Theme from '../Theme';
import Config from '../Config';
import * as Constants from '../Constants';
import * as ProfileActions from '../actions/ProfileActions';
import ProfileImport from "./ProfileImport";
import LoadingBar from './LoadingBar';
import Profiles from './Profiles';
import Logs from './Logs';
import * as Blueprint from "@blueprintjs/core";
import * as Alert from "../Alert";

let upgradeShown = false

interface State {
	path: string
	disabled: boolean
	menu: boolean
	showErrors: boolean
}

const css = {
	card: {
		minWidth: '310px',
		maxWidth: '380px',
		width: 'calc(100% - 20px)',
		margin: '60px auto',
	} as React.CSSProperties,
	nav: {
		overflowX: 'auto',
		overflowY: 'auto',
		userSelect: 'none',
		height: 'auto',
		padding: '0 4px 0 8px',
	} as React.CSSProperties,
	navTitle: {
		flexWrap: 'wrap',
		height: 'auto',
	} as React.CSSProperties,
	navGroup: {
		flexWrap: 'wrap',
		height: 'auto',
		padding: '4px 0',
	} as React.CSSProperties,
	link: {
		padding: '0 7px',
	} as React.CSSProperties,
	sub: {
		color: 'inherit',
	} as React.CSSProperties,
	heading: {
		fontFamily: "'Fredoka One', cursive",
		marginRight: '11px',
		fontSize: '26px',
	} as React.CSSProperties,
	loading: {
		position: 'absolute',
		width: '100%',
		zIndex: '100',
	} as React.CSSProperties,
	container: {
		height: '100%',
	} as React.CSSProperties,
	content: {
		overflowY: 'auto',
	} as React.CSSProperties,
	menuLabel: {
		fontWeight: "bold",
	} as React.CSSProperties,
	updateButton: {
		marginTop: "7px",
	} as React.CSSProperties,
};

export default class Main extends React.Component<{}, State> {
	constructor(props: any, context: any) {
		super(props, context);
		this.state = {
			path: "/",
			disabled: false,
			menu: false,
			showErrors: false,
		}
	}

	componentDidMount(): void {
		Constants.addChangeListener(this.onChange)
		Alert.addChangeListener(this.onAlert)
	}

	componentWillUnmount(): void {
		Constants.removeChangeListener(this.onChange)
		Alert.removeChangeListener(this.onAlert)
	}

	onChange = (): void => {
		this.setState({
			...this.state,
		})
	}

	onRefresh = (): void => {
		let pathname = "";

		this.setState({
			...this.state,
			disabled: true,
		});

		if (pathname === '/profiles') {
			ProfileActions.sync().then((): void => {
				this.setState({
					...this.state,
					disabled: false,
				});
			}).catch((): void => {
				this.setState({
					...this.state,
					disabled: false,
				});
			});
		} else if (pathname === '/logs') {
			ProfileActions.sync().then((): void => {
				this.setState({
					...this.state,
					disabled: false,
				});
			}).catch((): void => {
				this.setState({
					...this.state,
					disabled: false,
				});
			});
		} else {
			ProfileActions.sync().then((): void => {
				this.setState({
					...this.state,
					disabled: false,
				});
			}).catch((): void => {
				this.setState({
					...this.state,
					disabled: false,
				});
			});
		}
	}

	onTrayIcon = async (): Promise<void> => {
		Config.disable_tray_icon = !Config.disable_tray_icon
		await Config.save({
			disable_tray_icon: Config.disable_tray_icon,
		})

		if (Config.disable_tray_icon) {
			Alert.success("Tray icon disabled, restart client " +
				"for configuration to take effect")
		} else {
			Alert.success("Tray icon enabled, restart client " +
				"for configuration to take effect")
		}
	}

	onWindowFrame = async (): Promise<void> => {
		Config.frameless = !Config.frameless
		await Config.save({
			frameless: Config.frameless,
		})

		if (Config.frameless) {
			Alert.success("Window frame disabled, restart client " +
				"for configuration to take effect")
		} else {
			Alert.success("Window frame enabled, restart client " +
				"for configuration to take effect")
		}
	}

	onClassicIface = async (): Promise<void> => {
		Config.classic_interface = !Config.classic_interface
		await Config.save({
			classic_interface: Config.classic_interface,
		})

		if (Config.classic_interface) {
			Alert.success("Switched to classic interface, restart client " +
				"for configuration to take effect")
		} else {
			Alert.success("Switched to new interface, restart client " +
				"for configuration to take effect")
		}
	}

	onAlert = (toasts: number): void => {
		if (!toasts) {
			document.getElementById("toaster2").style.display = "none"
		}

		this.setState({
			...this.state,
			showErrors: !!toasts,
		})
	}

	render(): JSX.Element {
		if (Constants.state.upgrade && !upgradeShown) {
			upgradeShown = true

			let updateElm: JSX.Element = <div>
				<div>Update available, download the latest release below</div>
				<button
					className="bp3-button bp3-intent-primary bp3-icon-download"
					type="button"
					style={css.updateButton}
					onClick={(): void => {
						Electron.ipcRenderer.send("control", "download-update")
					}}
				>Download Update</button>
			</div>

			Alert.info(updateElm, 0)
		}

		let themeLabel = ""
		let themeIcon: Blueprint.IconName;
		if (Theme.theme() === "dark") {
			themeLabel = "Light Theme"
			themeIcon = "flash"
		} else {
			themeLabel = "Dark Theme"
			themeIcon = "moon"
		}

		let trayLabel = ""
		if (Config.disable_tray_icon) {
			trayLabel = "Enable Tray Icon"
		} else {
			trayLabel = "Disable Tray Icon"
		}

		let frameLabel = ""
		if (Config.frameless) {
			frameLabel = "Enable Window Frame"
		} else {
			frameLabel = "Disable Window Frame"
		}

		let ifaceLabel = ""
		if (Config.classic_interface) {
			ifaceLabel = "Use New Interface"
		} else {
			ifaceLabel = "Use Classic Interface"
		}

		let page: JSX.Element;
		switch (this.state.path) {
			case "/":
				page = <Profiles/>
				break
			case "/profiles":
				page = <Profiles/>
				break
			case "/logs":
				page = <Logs/>
				break
		}

		let version = Constants.state.version
		if (Constants.state.version) {
			version = " v" + Constants.state.version
		}

		let menu: JSX.Element = <Blueprint.Menu>
			<li
				className="bp3-menu-header"
				style={css.menuLabel}
			>{"Pritunl Client" + version}</li>
			<Blueprint.MenuDivider/>
			<Blueprint.MenuItem
				text={themeLabel}
				icon={themeIcon}
				onKeyDown={(evt): void => {
					if (evt.key === "Enter") {
						Theme.toggle()
						Theme.save()
					}
				}}
				onClick={(): void => {
					Theme.toggle()
					Theme.save()
				}}
			/>
			<Blueprint.MenuItem
				text="Refresh"
				icon="refresh"
				hidden={true}
				disabled={this.state.disabled}
				onKeyDown={(evt): void => {
					if (evt.key === "Enter") {
						this.onRefresh()
					}
				}}
				onClick={this.onRefresh}
			/>
			<Blueprint.MenuItem
				text={trayLabel}
				icon="dashboard"
				onKeyDown={(evt): void => {
					if (evt.key === "Enter") {
						this.onTrayIcon()
					}
				}}
				onClick={this.onTrayIcon}
			/>
			<Blueprint.MenuItem
				text={frameLabel}
				icon="application"
				hidden={Constants.platform === "win32"}
				onKeyDown={(evt): void => {
					if (evt.key === "Enter") {
						this.onWindowFrame()
					}
				}}
				onClick={this.onWindowFrame}
			/>
			<Blueprint.MenuItem
				text={ifaceLabel}
				icon="comparison"
				onKeyDown={(evt): void => {
					if (evt.key === "Enter") {
						this.onClassicIface()
					}
				}}
				onClick={this.onClassicIface}
			/>
			<Blueprint.MenuItem
				text="View Logs"
				icon="history"
				onKeyDown={(evt): void => {
					if (evt.key === "Enter") {
						this.setState({
							...this.state,
							path: "/logs",
						})
					}
				}}
				onClick={(): void => {
					this.setState({
						...this.state,
						path: "/logs",
					})
				}}
			/>
			<Blueprint.MenuItem
				text="Reload App"
				icon="refresh"
				onKeyDown={(evt): void => {
					if (evt.key === "Enter") {
						Electron.ipcRenderer.send("control", "reload")
					}
				}}
				onClick={(): void => {
					Electron.ipcRenderer.send("control", "reload")
				}}
			/>
			<Blueprint.MenuItem
				text="Developer Tools"
				icon="code"
				onClick={(): void => {
					Electron.ipcRenderer.send("control", "dev-tools")
				}}
			/>
		</Blueprint.Menu>

		let menuToggle: JSX.Element = <Blueprint.Button
			minimal={true}
			icon="menu"
		/>

		return <div style={css.container} className="layout vertical">
			<LoadingBar intent="primary" style={css.loading}/>
			<nav
				className="bp3-navbar layout horizontal"
				style={css.nav}
			>
				<div
					className="bp3-navbar-group bp3-align-left flex webkit-drag"
					style={css.navTitle}
				>
					<div
						className="bp3-navbar-heading"
						style={css.heading}
					>pritunl</div>
				</div>
				<div
					className="bp3-navbar-group bp3-align-right"
					style={css.navGroup}
				>
					<button
						className="bp3-button bp3-minimal bp3-intent-danger bp3-icon-error"
						style={css.link}
						hidden={!this.state.showErrors}
						onClick={() => {
							let elmnt = document.getElementById("toaster2")

							if (elmnt.style.display === "block") {
								elmnt.style.display = "none"
							} else {
								elmnt.style.display = "block"
							}
						}}
					/>
					<button
						className="bp3-button bp3-minimal bp3-icon-people"
						style={css.link}
						onClick={() => {
							this.setState({
								...this.state,
								path: "/profiles",
							})
						}}
					>
						Profiles
					</button>
					<ProfileImport
						style={css.link}
					/>
					<button
						className="bp3-button bp3-minimal bp3-icon-history"
						hidden={true}
						style={css.link}
						onClick={() => {
							this.setState({
								...this.state,
								path: "/logs",
							})
						}}
					>
						Logs
					</button>
					<div>
						<Blueprint.Popover
							position={Blueprint.Position.BOTTOM}
							content={menu}
							target={menuToggle}
							usePortal={true}
							minimal={true}
						/>
					</div>
					<button
						className="bp3-button bp3-minimal bp3-icon-minus"
						type="button"
						hidden={!Constants.frameless}
						onClick={(): void => {
							Electron.ipcRenderer.send("control", "minimize")
						}}
					/>
					<button
						className="bp3-button bp3-minimal bp3-icon-cross close-button"
						type="button"
						hidden={!Constants.frameless}
						onClick={(): void => {
							window.close()
						}}
					/>
				</div>
			</nav>
			<div className="layout vertical flex" style={css.content}>
				{page}
			</div>
		</div>
	}
}
