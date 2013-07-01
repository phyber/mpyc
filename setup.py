#from distutils.core import setup
from setuptools import setup, find_packages


setup(name='mpyc',
      version='1.0',
      description='Presents an Web frontend for MPD',
      author_email='bgates@microsoft.com',
      url='https://github.com/phyber/mpyc',
      license='proprietary and restricted',
      package_dir={'': 'src'},
      packages=find_packages('src'),
      package_data={'': []},
      include_package_data=True,
      install_requires=[
          "flask",
          "python-mpd"
      ],
      entry_points="""
          [console_scripts]
          run_server = mpyc.runserver:main
        """,
     )
