mkdir -p ./infomaniak
echo "Mounting Infomaniak drive..."
echo "Press Ctrl+C to unmount and stop"
rclone mount infomaniak-backup:default ./infomaniak \
	--vfs-cache-mode full \
	--read-only
