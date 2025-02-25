<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20241105050513 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE prestation DROP duree');
        $this->addSql('ALTER TABLE vol ADD duree DOUBLE PRECISION DEFAULT NULL');
        $this->addSql('ALTER TABLE vol ADD prix DOUBLE PRECISION DEFAULT NULL');
        $this->addSql('ALTER TABLE vol ADD option_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE vol ADD CONSTRAINT FK_95C97EBA7C41D6F FOREIGN KEY (option_id) REFERENCES option (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX IDX_95C97EBA7C41D6F ON vol (option_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE prestation ADD duree TIME(0) WITHOUT TIME ZONE DEFAULT NULL');
        $this->addSql('ALTER TABLE vol DROP CONSTRAINT FK_95C97EBA7C41D6F');
        $this->addSql('DROP INDEX IDX_95C97EBA7C41D6F');
        $this->addSql('ALTER TABLE vol DROP duree');
        $this->addSql('ALTER TABLE vol DROP prix');
        $this->addSql('ALTER TABLE vol DROP option_id');
    }
}
