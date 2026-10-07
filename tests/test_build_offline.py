import sys
from pathlib import Path
import pytest
from unittest.mock import patch, mock_open

# Import read_file from build_offline
from build_offline import read_file


def test_read_file_success(tmp_path):
    """Test read_file successfully reads content from a valid file."""
    test_file = tmp_path / "sample.txt"
    content = "Hello, IUPAC Chemistry! 🧪\nLine 2 with UTF-8: α, β, γ"
    test_file.write_text(content, encoding="utf-8")

    result = read_file(str(test_file))
    assert result == content


def test_read_file_empty(tmp_path):
    """Test read_file reads an empty file correctly."""
    empty_file = tmp_path / "empty.txt"
    empty_file.write_text("", encoding="utf-8")

    result = read_file(str(empty_file))
    assert result == ""


def test_read_file_not_found(capsys):
    """Test read_file handles FileNotFoundError and exits with status 1."""
    non_existent_path = "non_existent_file_12345.txt"

    with pytest.raises(SystemExit) as exc_info:
        read_file(non_existent_path)

    assert exc_info.value.code == 1

    captured = capsys.readouterr()
    assert f"❌ Error reading {non_existent_path}:" in captured.out


def test_read_file_permission_error(tmp_path, capsys):
    """Test read_file handles PermissionError or generic OS errors and exits with status 1."""
    test_file = tmp_path / "restricted.txt"
    test_file.write_text("secret", encoding="utf-8")

    with patch("builtins.open", side_effect=PermissionError("Permission denied")):
        with pytest.raises(SystemExit) as exc_info:
            read_file(str(test_file))

        assert exc_info.value.code == 1

    captured = capsys.readouterr()
    assert f"❌ Error reading {test_file}: Permission denied" in captured.out


def test_read_file_encoding_error(tmp_path, capsys):
    """Test read_file handles UnicodeDecodeError and exits with status 1."""
    test_file = tmp_path / "binary_data.bin"
    # Write invalid UTF-8 bytes
    test_file.write_bytes(b"\x80\x81\x82\xff")

    with pytest.raises(SystemExit) as exc_info:
        read_file(str(test_file))

    assert exc_info.value.code == 1

    captured = capsys.readouterr()
    assert f"❌ Error reading {test_file}:" in captured.out
