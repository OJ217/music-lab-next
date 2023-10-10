import { notifications } from '@mantine/notifications';
import { IconAlertTriangle, IconCheck, IconX } from '@tabler/icons-react';

type NotificationType = 'success' | 'fail' | 'warning';

// * Utility function actions:
// * [+] New notification caller function with above notification type
// * [+] autoClose timing is passed as seconds

export const notify = ({
	type,
	title,
	message = null,
	autoClose = 10
}: {
	type: NotificationType;
	title: string;
	message?: string | React.ReactNode | null;
	autoClose?: number;
}) => {
	const notificationStyle: Record<NotificationType, { iconClass: string; icon: JSX.Element }> = {
		success: {
			iconClass: 'bg-green-500 bg-opacity-25 border border-green-500',
			icon: (
				<IconCheck
					size={20}
					stroke={1.6}
				/>
			)
		},
		fail: {
			iconClass: 'bg-red-500 bg-opacity-25 border border-red-500',
			icon: (
				<IconX
					size={20}
					stroke={1.6}
				/>
			)
		},
		warning: {
			iconClass: 'bg-yellow-500 bg-opacity-25 border border-yellow-500',
			icon: (
				<IconAlertTriangle
					size={18}
					stroke={1.6}
				/>
			)
		}
	};

	notifications.clean();

	return notifications.show({
		title,
		message,
		withCloseButton: true,
		autoClose: autoClose * 1000,
		icon: notificationStyle[type].icon,
		classNames: { icon: notificationStyle[type].iconClass }
	});
};
